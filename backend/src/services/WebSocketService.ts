// WebSocketService.ts - Real-time communication service using Socket.IO
// Handles real-time synchronization between multiple clients

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with fallback for development
let supabase: any = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'https://placeholder.supabase.co' && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('✅ WebSocket: Supabase client initialized');
  } catch (error) {
    console.warn('⚠️ WebSocket: Supabase initialization failed, using mock mode');
    supabase = null;
  }
} else {
  console.log('ℹ️ WebSocket: Running in development mode without Supabase');
}

// Real-time event types
interface TarotRealtimeEvents {
  // Daily Session Events
  'daily-session:updated': {
    userId: string;
    date: string;
    changes: any;
    timestamp: number;
    deviceId?: string;
  };

  // Spread Reading Events
  'spread:created': {
    userId: string;
    spread: any;
    timestamp: number;
    deviceId?: string;
  };

  'spread:updated': {
    userId: string;
    spreadId: string;
    changes: any;
    timestamp: number;
    deviceId?: string;
  };

  'spread:deleted': {
    userId: string;
    spreadId: string;
    timestamp: number;
    deviceId?: string;
  };

  // System Events
  'user:connected': {
    userId: string;
    deviceId: string;
    timestamp: number;
  };

  'user:disconnected': {
    userId: string;
    deviceId: string;
    timestamp: number;
  };

  'sync:conflict': {
    userId: string;
    conflictData: any;
    timestamp: number;
  };

  // Client-to-server events
  'join:user-room': {
    userId: string;
    deviceId: string;
  };

  'leave:user-room': {
    userId: string;
    deviceId: string;
  };
}

// Socket connection interface
interface AuthenticatedSocket extends Socket<any, any, any, any> {
  userId?: string;
  deviceId?: string;
  isAuthenticated?: boolean;
}

export class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private userDevices: Map<string, string> = new Map(); // socketId -> deviceId

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:8082",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.setupSupabaseRealtime();
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket: any, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token (same logic as REST API)
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

        if (!decoded.userId) {
          return next(new Error('Invalid token payload'));
        }

        // Verify user exists in database
        const { data: user, error } = await supabase
          .from('users')
          .select('id, email')
          .eq('id', decoded.userId)
          .single();

        if (error || !user) {
          return next(new Error('User not found'));
        }

        socket.userId = decoded.userId;
        socket.deviceId = socket.handshake.auth.deviceId || `device_${Date.now()}`;
        socket.isAuthenticated = true;

        console.log(`[WebSocket] User ${decoded.userId} authenticated on device ${socket.deviceId}`);
        next();

      } catch (error) {
        console.error('[WebSocket] Authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: any) => {
      console.log(`[WebSocket] Client connected: ${socket.id} (User: ${socket.userId})`);

      // Join user's personal room
      if (socket.userId) {
        socket.join(`user:${socket.userId}`);

        // Track connected users
        if (!this.connectedUsers.has(socket.userId)) {
          this.connectedUsers.set(socket.userId, new Set());
        }
        this.connectedUsers.get(socket.userId)!.add(socket.id);
        this.userDevices.set(socket.id, socket.deviceId!);

        // Emit user connected event
        this.emitToUser(socket.userId, 'user:connected', {
          userId: socket.userId,
          deviceId: socket.deviceId!,
          timestamp: Date.now()
        });
      }

      // Handle daily session updates
      socket.on('daily-session:update', async (data: any) => {
        try {
          const { date, changes } = data;

          // Broadcast to all user's devices except sender
          const eventData: TarotRealtimeEvents['daily-session:updated'] = {
            userId: socket.userId!,
            date,
            changes,
            timestamp: Date.now(),
            deviceId: socket.deviceId
          };

          socket.to(`user:${socket.userId}`).emit('daily-session:updated', eventData);

          console.log(`[WebSocket] Daily session updated for user ${socket.userId} on ${date}`);

        } catch (error) {
          console.error('[WebSocket] Daily session update error:', error);
          socket.emit('error', { message: 'Failed to update daily session' });
        }
      });

      // Handle spread updates
      socket.on('spread:update', async (data: any) => {
        try {
          const { spreadId, changes, type } = data; // type: 'created' | 'updated' | 'deleted'

          let eventName: keyof TarotRealtimeEvents;
          let eventData: any;

          switch (type) {
            case 'created':
              eventName = 'spread:created';
              eventData = {
                userId: socket.userId!,
                spread: changes,
                timestamp: Date.now(),
                deviceId: socket.deviceId
              };
              break;

            case 'updated':
              eventName = 'spread:updated';
              eventData = {
                userId: socket.userId!,
                spreadId,
                changes,
                timestamp: Date.now(),
                deviceId: socket.deviceId
              };
              break;

            case 'deleted':
              eventName = 'spread:deleted';
              eventData = {
                userId: socket.userId!,
                spreadId,
                timestamp: Date.now(),
                deviceId: socket.deviceId
              };
              break;

            default:
              throw new Error('Invalid spread update type');
          }

          // Broadcast to all user's devices except sender
          socket.to(`user:${socket.userId}`).emit(eventName, eventData);

          console.log(`[WebSocket] Spread ${type} for user ${socket.userId}: ${spreadId || 'new'}`);

        } catch (error) {
          console.error('[WebSocket] Spread update error:', error);
          socket.emit('error', { message: 'Failed to update spread' });
        }
      });

      // Handle sync conflicts
      socket.on('sync:conflict', (data: any) => {
        try {
          const conflictData: TarotRealtimeEvents['sync:conflict'] = {
            userId: socket.userId!,
            conflictData: data,
            timestamp: Date.now()
          };

          // Broadcast conflict to all user's devices
          this.emitToUser(socket.userId!, 'sync:conflict', conflictData);

          console.log(`[WebSocket] Sync conflict detected for user ${socket.userId}`);

        } catch (error) {
          console.error('[WebSocket] Sync conflict error:', error);
        }
      });

      // Handle disconnection
      socket.on('disconnect', (reason: string) => {
        console.log(`[WebSocket] Client disconnected: ${socket.id} (Reason: ${reason})`);

        if (socket.userId) {
          // Remove from connected users tracking
          const userSockets = this.connectedUsers.get(socket.userId);
          if (userSockets) {
            userSockets.delete(socket.id);
            if (userSockets.size === 0) {
              this.connectedUsers.delete(socket.userId);
            }
          }

          // Clean up device tracking
          this.userDevices.delete(socket.id);

          // Emit user disconnected event
          this.emitToUser(socket.userId, 'user:disconnected', {
            userId: socket.userId,
            deviceId: socket.deviceId!,
            timestamp: Date.now()
          });
        }
      });

      // Handle errors
      socket.on('error', (error: any) => {
        console.error(`[WebSocket] Socket error for ${socket.id}:`, error);
      });
    });

    console.log('[WebSocket] Event handlers set up successfully');
  }

  private setupSupabaseRealtime(): void {
    // Skip if Supabase is not available
    if (!supabase) {
      console.log('[WebSocket] Skipping Supabase realtime setup - running in mock mode');
      return;
    }

    // Listen to changes in daily_tarot_sessions table
    supabase
      .channel('daily_tarot_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_tarot_sessions'
        },
        (payload) => {
          console.log('[Supabase Realtime] Daily session change:', payload);

          // Extract user_id from the payload
          const userId = (payload.new as any)?.user_id || (payload.old as any)?.user_id;
          if (!userId) return;

          // Emit to WebSocket clients
          this.emitToUser(userId, 'daily-session:updated', {
            userId,
            date: (payload.new as any)?.date || (payload.old as any)?.date,
            changes: payload.new || payload.old,
            timestamp: Date.now()
          });
        }
      )
      .subscribe();

    // Listen to changes in spread_readings table
    supabase
      .channel('spread_readings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'spread_readings'
        },
        (payload) => {
          console.log('[Supabase Realtime] Spread reading change:', payload);

          const userId = (payload.new as any)?.user_id || (payload.old as any)?.user_id;
          if (!userId) return;

          let eventName: keyof TarotRealtimeEvents;
          let eventData: any;

          switch (payload.eventType) {
            case 'INSERT':
              eventName = 'spread:created';
              eventData = {
                userId,
                spread: payload.new,
                timestamp: Date.now()
              };
              break;

            case 'UPDATE':
              eventName = 'spread:updated';
              eventData = {
                userId,
                spreadId: (payload.new as any)?.id,
                changes: payload.new,
                timestamp: Date.now()
              };
              break;

            case 'DELETE':
              eventName = 'spread:deleted';
              eventData = {
                userId,
                spreadId: (payload.old as any)?.id,
                timestamp: Date.now()
              };
              break;

            default:
              return;
          }

          this.emitToUser(userId, eventName, eventData);
        }
      )
      .subscribe();

    console.log('[WebSocket] Supabase realtime listeners set up successfully');
  }

  // Utility methods

  public emitToUser<K extends keyof TarotRealtimeEvents>(
    userId: string,
    event: K,
    data: TarotRealtimeEvents[K]
  ): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public emitToSocket(socketId: string, event: string, data: any): void {
    this.io.to(socketId).emit(event, data);
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  public getUserConnections(userId: string): number {
    return this.connectedUsers.get(userId)?.size || 0;
  }

  public isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  public getServerStats(): {
    connectedClients: number;
    connectedUsers: number;
    totalConnections: number;
  } {
    return {
      connectedClients: this.io.engine.clientsCount,
      connectedUsers: this.connectedUsers.size,
      totalConnections: Array.from(this.connectedUsers.values())
        .reduce((total, sockets) => total + sockets.size, 0)
    };
  }

  // Health check for monitoring
  public healthCheck(): { status: string; stats: any; timestamp: string } {
    const stats = this.getServerStats();

    return {
      status: 'healthy',
      stats,
      timestamp: new Date().toISOString()
    };
  }

  // Graceful shutdown
  public async shutdown(): Promise<void> {
    console.log('[WebSocket] Shutting down WebSocket service...');

    // Notify all connected clients about shutdown
    this.io.emit('server:shutdown', {
      message: 'Server is shutting down',
      timestamp: Date.now()
    });

    // Close all connections
    this.io.close();

    console.log('[WebSocket] WebSocket service shut down successfully');
  }
}

export default WebSocketService;