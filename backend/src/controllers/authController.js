const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
    const { email, password, language = 'ko', timezone = 'Asia/Seoul' } = req.body;

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

    // Create user in our database
    const { data: user, error: dbError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: authData.user.email,
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

    // Authenticate with Supabase
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

    if (!userId) {
      return res.status(401).json({
        error: 'User not authenticated',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if trial has expired
    const now = new Date();
    const trialEndDate = new Date(user.trial_end_date);
    const isTrialActive = user.subscription_status === 'trial' && trialEndDate > now;
    const isSubscriptionActive = user.subscription_status === 'active';

    res.json({
      user: {
        id: user.id,
        email: user.email,
        language: user.language,
        timezone: user.timezone,
        subscriptionStatus: user.subscription_status,
        trialStartDate: user.trial_start_date,
        trialEndDate: user.trial_end_date,
        activeCardThemeId: user.active_card_theme_id,
        totalSessions: user.total_sessions,
        lastActive: user.last_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
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

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser
};