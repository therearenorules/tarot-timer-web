const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

// Initialize Supabase client with fallback for development
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'https://placeholder.supabase.co' && process.env.SUPABASE_URL !== 'https://example.supabase.co') {
  try {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
    );
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.warn('⚠️ Supabase initialization failed:', error.message);
    console.warn('Running in development mode without Supabase');
  }
} else {
  console.log('ℹ️ Running in development mode without Supabase (using mock authentication)');
}

// JWT utility functions
const generateAccessToken = (userId, email) => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  const payload = { userId, email, type: 'access' };
  const options = { expiresIn: '7d' };

  return jwt.sign(payload, secret, options);
};

const generateRefreshToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  const payload = { userId, type: 'refresh' };
  const options = { expiresIn: '30d' };

  return jwt.sign(payload, secret, options);
};

const register = async (req, res) => {
  try {
    const { email, password, name, language = 'ko', timezone = 'Asia/Seoul' } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long',
        code: 'WEAK_PASSWORD'
      });
    }

    // Development mode: Create mock user without Supabase
    if (!supabase) {
      console.log('🔧 Development mode: Creating mock user without Supabase');

      // Generate mock user ID
      const userId = `dev_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create mock user object
      const user = {
        id: userId,
        email: email,
        name: name || email.split('@')[0],
        language: language,
        timezone: timezone,
        subscription_status: 'trial',
        trial_start_date: new Date().toISOString(),
        trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days trial
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Generate tokens
      const accessToken = generateAccessToken(user.id, user.email);
      const refreshToken = generateRefreshToken(user.id);

      console.log(`✅ Mock user created: ${user.email} (ID: ${user.id})`);

      return res.status(201).json({
        message: 'User registered successfully (Development Mode)',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          language: user.language,
          timezone: user.timezone,
          subscriptionStatus: user.subscription_status,
          trialEndDate: user.trial_end_date,
          createdAt: user.created_at
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        }
      });
    }

    // Production mode: Use Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return res.status(400).json({
        error: authError.message,
        code: 'AUTH_ERROR'
      });
    }

    // Create user in our database
    const { data: user, error: dbError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: authData.user.email,
        name: name || email.split('@')[0],
        language,
        timezone,
        subscription_status: 'trial',
        trial_start_date: new Date().toISOString(),
      }])
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      return res.status(500).json({
        error: 'Failed to create user in database',
        code: 'DB_INSERT_ERROR'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        language: user.language,
        timezone: user.timezone,
        subscriptionStatus: user.subscription_status,
        trialEndDate: user.trial_end_date,
        createdAt: user.created_at
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle Prisma unique constraint violations
    if (error?.code === 'P2002') {
      return res.status(409).json({
        error: 'User with this email already exists',
        code: 'USER_EXISTS'
      });
    }

    res.status(500).json({
      error: 'Internal server error during registration',
      code: 'INTERNAL_ERROR'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Development mode: Mock login without Supabase
    if (!supabase) {
      console.log('🔧 Development mode: Mock login without Supabase');

      // Mock user validation (accept any email/password for development)
      if (!email.includes('@') || password.length < 6) {
        return res.status(401).json({
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Generate mock user ID
      const userId = `dev_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create mock user object
      const user = {
        id: userId,
        email: email,
        name: email.split('@')[0],
        language: 'ko',
        timezone: 'Asia/Seoul',
        subscription_status: 'trial',
        trial_start_date: new Date().toISOString(),
        trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days trial
        last_active: new Date().toISOString(),
        total_sessions: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Generate tokens
      const accessToken = generateAccessToken(user.id, user.email);
      const refreshToken = generateRefreshToken(user.id);

      console.log(`✅ Mock login successful: ${user.email} (ID: ${user.id})`);

      return res.json({
        message: 'Login successful (Development Mode)',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          language: user.language,
          timezone: user.timezone,
          subscriptionStatus: user.subscription_status,
          trialEndDate: user.trial_end_date,
          activeCardThemeId: user.active_card_theme_id
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        }
      });
    }

    // Production mode: Use Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Login error:', authError);
      return res.status(401).json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Get user from our database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        error: 'User not found in database',
        code: 'USER_NOT_FOUND'
      });
    }

    // Update last active timestamp
    await supabase
      .from('users')
      .update({
        last_active: new Date().toISOString(),
        total_sessions: (user.total_sessions || 0) + 1
      })
      .eq('id', user.id);

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        language: user.language,
        timezone: user.timezone,
        subscriptionStatus: user.subscription_status,
        trialEndDate: user.trial_end_date,
        activeCardThemeId: user.active_card_theme_id
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error during login',
      code: 'INTERNAL_ERROR'
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token is required',
        code: 'MISSING_REFRESH_TOKEN'
      });
    }

    // Verify refresh token
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(refreshToken, secret);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user.id, user.email);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    res.status(500).json({
      error: 'Internal server error during token refresh',
      code: 'INTERNAL_ERROR'
    });
  }
};

const logout = async (req, res) => {
  try {
    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error during logout',
      code: 'INTERNAL_ERROR'
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = req.user; // This is set by auth middleware

    if (!userId) {
      return res.status(401).json({
        error: 'User not authenticated',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Development mode: Use user data from auth middleware (which creates mock user)
    console.log('🔍 Debug: supabase value:', supabase);
    console.log('🔍 Debug: typeof supabase:', typeof supabase);
    if (!supabase) {
      console.log('🔧 Development mode: Returning user info from auth middleware');

      // If we have user from middleware, use it; otherwise create mock data
      const mockUser = user || {
        id: userId,
        email: 'dev@example.com',
        subscription_status: 'trial',
        trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      // Check if trial has expired
      const now = new Date();
      const trialEndDate = new Date(mockUser.trial_end_date);
      const isTrialActive = mockUser.subscription_status === 'trial' && trialEndDate > now;
      const isSubscriptionActive = mockUser.subscription_status === 'active';

      res.json({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          language: mockUser.language || 'ko',
          timezone: mockUser.timezone || 'Asia/Seoul',
          subscriptionStatus: mockUser.subscription_status,
          trialStartDate: mockUser.trial_start_date || new Date().toISOString(),
          trialEndDate: mockUser.trial_end_date,
          activeCardThemeId: mockUser.active_card_theme_id || null,
          totalSessions: mockUser.total_sessions || 0,
          lastActive: mockUser.last_active || new Date().toISOString(),
          createdAt: mockUser.created_at || new Date().toISOString(),
          updatedAt: mockUser.updated_at || new Date().toISOString(),
          hasActiveSubscription: isSubscriptionActive,
          isTrialActive,
          trialDaysRemaining: isTrialActive
            ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            : 0
        }
      });
      return;
    }

    // Production mode: Get user from database
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !dbUser) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if trial has expired
    const now = new Date();
    const trialEndDate = new Date(dbUser.trial_end_date);
    const isTrialActive = dbUser.subscription_status === 'trial' && trialEndDate > now;
    const isSubscriptionActive = dbUser.subscription_status === 'active';

    res.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        language: dbUser.language,
        timezone: dbUser.timezone,
        subscriptionStatus: dbUser.subscription_status,
        trialStartDate: dbUser.trial_start_date,
        trialEndDate: dbUser.trial_end_date,
        activeCardThemeId: dbUser.active_card_theme_id,
        totalSessions: dbUser.total_sessions,
        lastActive: dbUser.last_active,
        createdAt: dbUser.created_at,
        updatedAt: dbUser.updated_at,
        hasActiveSubscription: isSubscriptionActive,
        isTrialActive,
        trialDaysRemaining: isTrialActive
          ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : 0
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Internal server error getting user info',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Guest user creation
const createGuestUser = async (req, res) => {
  try {
    // Generate unique guest ID
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // TODO: Store guest ID in database with minimal info
    console.log(`Creating guest user: ${guestId}`);

    res.status(201).json({
      message: 'Guest user created successfully',
      guestId
    });
  } catch (error) {
    console.error('Guest user creation error:', error);
    res.status(500).json({
      error: 'Internal server error during guest user creation',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Upgrade guest user to registered user
const upgradeGuestToUser = async (req, res) => {
  try {
    const { guestId, email, password } = req.body;

    // Validate input
    if (!guestId || !email || !password) {
      return res.status(400).json({
        error: 'Guest ID, email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long',
        code: 'WEAK_PASSWORD'
      });
    }

    // TODO: Check if guest user exists and get guest data
    console.log(`Upgrading guest user ${guestId} to registered user with email ${email}`);

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return res.status(400).json({
        error: authError.message,
        code: 'AUTH_ERROR'
      });
    }

    // Create user in our database with guest data migration
    const { data: user, error: dbError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: authData.user.email,
        language: 'ko',
        timezone: 'Asia/Seoul',
        subscription_status: 'trial',
        trial_start_date: new Date().toISOString(),
        // TODO: Migrate guest user data here
      }])
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      return res.status(500).json({
        error: 'Failed to create user in database',
        code: 'DB_INSERT_ERROR'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

    // TODO: Clean up guest user data
    console.log(`Successfully upgraded guest ${guestId} to user ${user.id}`);

    res.status(201).json({
      message: 'Guest user upgraded successfully',
      user: {
        id: user.id,
        email: user.email,
        language: user.language,
        timezone: user.timezone,
        subscriptionStatus: user.subscription_status,
        trialEndDate: user.trial_end_date,
        createdAt: user.created_at
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    });

  } catch (error) {
    console.error('Guest upgrade error:', error);

    // Handle Prisma unique constraint violations
    if (error?.code === 'P2002') {
      return res.status(409).json({
        error: 'User with this email already exists',
        code: 'USER_EXISTS'
      });
    }

    res.status(500).json({
      error: 'Internal server error during guest upgrade',
      code: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser,
  createGuestUser,
  upgradeGuestToUser
};