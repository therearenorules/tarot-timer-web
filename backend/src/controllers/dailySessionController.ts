import { Request, Response } from 'express';
import Joi from 'joi';

// Mock storage for development (without database)
// This simulates the current frontend storage structure
const mockStorage = new Map<string, any>();

// Validation schemas matching frontend data structures
const dailyTarotSaveSchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  hourlyCards: Joi.array().items(
    Joi.object({
      id: Joi.number().integer().min(0).max(77).required(),
      name: Joi.string().required(),
      nameKr: Joi.string().required(),
      meaning: Joi.string().required(),
      meaningKr: Joi.string().required(),
      keywords: Joi.array().items(Joi.string()).default([]),
      arcana: Joi.string().valid('Major', 'Minor').required(),
      suit: Joi.string().optional(),
      imageUrl: Joi.any().optional()
    })
  ).length(24).required(),
  memos: Joi.object().pattern(
    /^(0|1[0-9]|2[0-3])$/, // hours 0-23
    Joi.string().allow('').max(1000)
  ).default({})
});

const memosUpdateSchema = Joi.object({
  memos: Joi.object().pattern(
    /^(0|1[0-9]|2[0-3])$/, // hours 0-23
    Joi.string().allow('').max(1000)
  ).required()
});

// Get all daily sessions for user
export async function getDailySessions(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access your daily sessions'
      });
    }

    const userId = req.user.id;
    
    // Get all sessions for this user from mock storage
    const userSessions: any[] = [];
    for (const [key, value] of mockStorage.entries()) {
      if (key.startsWith(`DAILY_TAROT_${userId}_`)) {
        userSessions.push({
          date: key.split('_')[3], // Extract date from key
          ...value,
          id: key
        });
      }
    }

    // Sort by date (newest first)
    userSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({
      sessions: userSessions,
      total: userSessions.length,
      message: userSessions.length === 0 ? 'No daily sessions found' : `Found ${userSessions.length} daily sessions`
    });

  } catch (error) {
    console.error('Get daily sessions error:', error);
    res.status(500).json({
      error: 'Failed to retrieve daily sessions',
      message: 'Internal server error'
    });
  }
}

// Get specific daily session by date
export async function getDailySession(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access your daily session'
      });
    }

    const { date } = req.params;
    const userId = req.user.id;

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: 'Date must be in YYYY-MM-DD format'
      });
    }

    const storageKey = `DAILY_TAROT_${userId}_${date}`;
    const session = mockStorage.get(storageKey);

    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        message: `No daily session found for date: ${date}`
      });
    }

    res.json({
      date,
      ...session,
      id: storageKey
    });

  } catch (error) {
    console.error('Get daily session error:', error);
    res.status(500).json({
      error: 'Failed to retrieve daily session',
      message: 'Internal server error'
    });
  }
}

// Create or update daily session
export async function createOrUpdateDailySession(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to save daily session'
      });
    }

    // Validate input
    const { error, value } = dailyTarotSaveSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    const { date, hourlyCards, memos } = value;
    const userId = req.user.id;
    const storageKey = `DAILY_TAROT_${userId}_${date}`;

    // Check if session already exists
    const existingSession = mockStorage.get(storageKey);
    const isUpdate = !!existingSession;

    // Create the session data matching frontend structure
    const sessionData = {
      date,
      hourlyCards,
      memos: memos || {},
      createdAt: existingSession?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to mock storage
    mockStorage.set(storageKey, sessionData);

    res.status(isUpdate ? 200 : 201).json({
      message: isUpdate ? 'Daily session updated successfully' : 'Daily session created successfully',
      session: {
        id: storageKey,
        ...sessionData
      },
      metadata: {
        isUpdate,
        cardsCount: hourlyCards.length,
        memosCount: Object.keys(memos || {}).length
      }
    });

  } catch (error) {
    console.error('Create/update daily session error:', error);
    res.status(500).json({
      error: 'Failed to save daily session',
      message: 'Internal server error'
    });
  }
}

// Update only memos for a specific date
export async function updateDailySessionMemos(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to update memos'
      });
    }

    const { date } = req.params;
    const userId = req.user.id;

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: 'Date must be in YYYY-MM-DD format'
      });
    }

    // Validate input
    const { error, value } = memosUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    const { memos } = value;
    const storageKey = `DAILY_TAROT_${userId}_${date}`;

    // Check if session exists
    const existingSession = mockStorage.get(storageKey);
    if (!existingSession) {
      return res.status(404).json({
        error: 'Session not found',
        message: `No daily session found for date: ${date}`
      });
    }

    // Update only the memos
    const updatedSession = {
      ...existingSession,
      memos,
      updatedAt: new Date().toISOString()
    };

    mockStorage.set(storageKey, updatedSession);

    res.json({
      message: 'Memos updated successfully',
      session: {
        id: storageKey,
        ...updatedSession
      },
      metadata: {
        memosCount: Object.keys(memos).length,
        updatedAt: updatedSession.updatedAt
      }
    });

  } catch (error) {
    console.error('Update memos error:', error);
    res.status(500).json({
      error: 'Failed to update memos',
      message: 'Internal server error'
    });
  }
}

// Delete daily session
export async function deleteDailySession(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to delete daily session'
      });
    }

    const { date } = req.params;
    const userId = req.user.id;

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: 'Date must be in YYYY-MM-DD format'
      });
    }

    const storageKey = `DAILY_TAROT_${userId}_${date}`;

    // Check if session exists
    if (!mockStorage.has(storageKey)) {
      return res.status(404).json({
        error: 'Session not found',
        message: `No daily session found for date: ${date}`
      });
    }

    // Delete from mock storage
    mockStorage.delete(storageKey);

    res.json({
      message: 'Daily session deleted successfully',
      date,
      deletedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Delete daily session error:', error);
    res.status(500).json({
      error: 'Failed to delete daily session',
      message: 'Internal server error'
    });
  }
}

// Get storage stats (for debugging)
export async function getStorageStats(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const userId = req.user.id;
    let userSessionsCount = 0;
    const dates: string[] = [];

    for (const [key] of mockStorage.entries()) {
      if (key.startsWith(`DAILY_TAROT_${userId}_`)) {
        userSessionsCount++;
        dates.push(key.split('_')[3]);
      }
    }

    res.json({
      userId,
      totalSessions: userSessionsCount,
      totalStorageEntries: mockStorage.size,
      dates: dates.sort(),
      storageType: 'in-memory (development)',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get storage stats error:', error);
    res.status(500).json({
      error: 'Failed to get storage stats',
      message: 'Internal server error'
    });
  }
}