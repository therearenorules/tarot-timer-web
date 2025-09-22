const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 조건부 생성
let supabase = null;
if (process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_URL.includes('example') &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  console.log('✅ Supabase client initialized');
} else {
  console.log('ℹ️ Supabase not configured, running in mock mode');
}

// Get daily session for a specific date
const getDailySession = async (req, res) => {
  try {
    const userId = req.userId;
    const { date } = req.params; // Format: YYYY-MM-DD

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        error: 'Valid date in YYYY-MM-DD format is required',
        code: 'INVALID_DATE_FORMAT'
      });
    }

    // Supabase가 없으면 mock 응답 반환
    if (!supabase) {
      return res.status(200).json({
        session: null,
        message: 'Running in development mode - data stored locally'
      });
    }

    const { data: session, error } = await supabase
      .from('daily_tarot_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Database error:', error);
      return res.status(500).json({
        error: 'Failed to retrieve daily session',
        code: 'DB_QUERY_ERROR'
      });
    }

    // Return empty session if not found
    if (!session) {
      return res.json({
        date,
        cards: Array(24).fill(null), // 24 empty slots for each hour
        memos: {},
        insights: null,
        exists: false
      });
    }

    res.json({
      id: session.id,
      date: session.date,
      cards: session.cards,
      memos: session.memos || {},
      insights: session.insights,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      exists: true
    });

  } catch (error) {
    console.error('Get daily session error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Save/Update daily session
const saveDailySession = async (req, res) => {
  try {
    const userId = req.userId;
    const { date, cards, memos, insights } = req.body;

    // Validate required fields
    if (!date || !cards) {
      return res.status(400).json({
        error: 'Date and cards are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        error: 'Date must be in YYYY-MM-DD format',
        code: 'INVALID_DATE_FORMAT'
      });
    }

    // Validate cards array (should have 24 elements for each hour)
    if (!Array.isArray(cards) || cards.length !== 24) {
      return res.status(400).json({
        error: 'Cards must be an array of 24 elements (one for each hour)',
        code: 'INVALID_CARDS_FORMAT'
      });
    }

    // Development mode: Return mock success if Supabase is not configured
    if (!supabase) {
      console.log('🔧 Development mode: Mock saving daily session data');
      const mockSession = {
        id: 'mock_session_' + Date.now(),
        user_id: userId,
        date: date,
        cards: cards,
        memos: memos || {},
        insights: insights || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return res.json({
        message: 'Daily session saved successfully (Development Mode)',
        session: mockSession
      });
    }

    const sessionData = {
      user_id: userId,
      date,
      cards,
      memos: memos || {},
      insights: insights || null,
      updated_at: new Date().toISOString()
    };

    // Use upsert to either insert or update
    const { data: session, error } = await supabase
      .from('daily_tarot_sessions')
      .upsert(sessionData, {
        onConflict: 'user_id,date',
        returning: 'representation'
      })
      .select()
      .single();

    if (error) {
      console.error('Database upsert error:', error);
      return res.status(500).json({
        error: 'Failed to save daily session',
        code: 'DB_UPSERT_ERROR'
      });
    }

    res.json({
      message: 'Daily session saved successfully',
      session: {
        id: session.id,
        date: session.date,
        cards: session.cards,
        memos: session.memos,
        insights: session.insights,
        createdAt: session.created_at,
        updatedAt: session.updated_at
      }
    });

  } catch (error) {
    console.error('Save daily session error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Get multiple daily sessions (for date range or recent sessions)
const getDailySessions = async (req, res) => {
  try {
    const userId = req.userId;
    const { startDate, endDate, limit = 30 } = req.query;

    // Development mode: Return mock data if Supabase is not configured
    if (!supabase) {
      console.log('🔧 Development mode: Returning mock daily sessions data');
      return res.json({
        data: [
          {
            id: 'mock_session_' + Date.now(),
            user_id: userId,
            date: new Date().toISOString().split('T')[0],
            card_drawn: 'The Sun',
            interpretation: 'A day full of positive energy and success.',
            reflection: null,
            mood_before: 'curious',
            mood_after: 'inspired',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ],
        count: 1
      });
    }

    let query = supabase
      .from('daily_tarot_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    // Add date range filters if provided
    if (startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      query = query.gte('date', startDate);
    }
    if (endDate && /^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      query = query.lte('date', endDate);
    }

    // Limit results
    const limitNum = Math.min(parseInt(limit) || 30, 100); // Max 100 sessions
    query = query.limit(limitNum);

    const { data: sessions, error } = await query;

    if (error) {
      console.error('Database query error:', error);
      return res.status(500).json({
        error: 'Failed to retrieve daily sessions',
        code: 'DB_QUERY_ERROR'
      });
    }

    const formattedSessions = sessions.map(session => ({
      id: session.id,
      date: session.date,
      cards: session.cards,
      memos: session.memos || {},
      insights: session.insights,
      createdAt: session.created_at,
      updatedAt: session.updated_at
    }));

    res.json({
      sessions: formattedSessions,
      total: formattedSessions.length
    });

  } catch (error) {
    console.error('Get daily sessions error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Delete daily session
const deleteDailySession = async (req, res) => {
  try {
    const userId = req.userId;
    const { date } = req.params;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        error: 'Valid date in YYYY-MM-DD format is required',
        code: 'INVALID_DATE_FORMAT'
      });
    }

    // Development mode: Return mock success if Supabase is not configured
    if (!supabase) {
      console.log('🔧 Development mode: Mock deleting daily session data');
      return res.json({
        message: 'Daily session deleted successfully (Development Mode)',
        date
      });
    }

    const { error } = await supabase
      .from('daily_tarot_sessions')
      .delete()
      .eq('user_id', userId)
      .eq('date', date);

    if (error) {
      console.error('Database delete error:', error);
      return res.status(500).json({
        error: 'Failed to delete daily session',
        code: 'DB_DELETE_ERROR'
      });
    }

    res.json({
      message: 'Daily session deleted successfully',
      date
    });

  } catch (error) {
    console.error('Delete daily session error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  getDailySession,
  saveDailySession,
  getDailySessions,
  deleteDailySession
};