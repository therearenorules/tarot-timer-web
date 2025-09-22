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
  console.log('✅ Supabase client initialized (spreadController)');
} else {
  console.log('ℹ️ Supabase not configured, running in mock mode (spreadController)');
}

// Get all spread readings for user
const getSpreads = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 50, offset = 0, spreadType } = req.query;

    let query = supabase
      .from('spread_readings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Filter by spread type if specified
    if (spreadType) {
      query = query.eq('spread_type', spreadType);
    }

    // Add pagination
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const offsetNum = parseInt(offset) || 0;
    query = query.range(offsetNum, offsetNum + limitNum - 1);

    const { data: spreads, error } = await query;

    if (error) {
      console.error('Database query error:', error);
      return res.status(500).json({
        error: 'Failed to retrieve spread readings',
        code: 'DB_QUERY_ERROR'
      });
    }

    const formattedSpreads = spreads.map(spread => ({
      id: spread.id,
      title: spread.title,
      spreadType: spread.spread_type,
      spreadName: spread.spread_name,
      spreadNameEn: spread.spread_name_en,
      positions: spread.positions,
      insights: spread.insights,
      tags: spread.tags || [],
      createdAt: spread.created_at,
      updatedAt: spread.updated_at
    }));

    res.json({
      spreads: formattedSpreads,
      total: formattedSpreads.length,
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        hasMore: formattedSpreads.length === limitNum
      }
    });

  } catch (error) {
    console.error('Get spreads error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Get specific spread reading by ID
const getSpread = async (req, res) => {
  try {
    const userId = req.userId;
    const { spreadId } = req.params;

    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(spreadId)) {
      return res.status(400).json({
        error: 'Invalid spread ID format',
        code: 'INVALID_ID_FORMAT'
      });
    }

    const { data: spread, error } = await supabase
      .from('spread_readings')
      .select('*')
      .eq('user_id', userId)
      .eq('id', spreadId)
      .single();

    if (error || !spread) {
      return res.status(404).json({
        error: 'Spread reading not found',
        code: 'SPREAD_NOT_FOUND'
      });
    }

    res.json({
      id: spread.id,
      title: spread.title,
      spreadType: spread.spread_type,
      spreadName: spread.spread_name,
      spreadNameEn: spread.spread_name_en,
      positions: spread.positions,
      insights: spread.insights,
      tags: spread.tags || [],
      createdAt: spread.created_at,
      updatedAt: spread.updated_at
    });

  } catch (error) {
    console.error('Get spread error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Save new spread reading
const saveSpread = async (req, res) => {
  try {
    const userId = req.userId;
    const { title, spreadType, spreadName, spreadNameEn, positions, insights, tags } = req.body;

    // Validate required fields
    if (!title || !spreadType || !spreadName || !positions) {
      return res.status(400).json({
        error: 'Title, spreadType, spreadName, and positions are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Validate positions array
    if (!Array.isArray(positions) || positions.length === 0) {
      return res.status(400).json({
        error: 'Positions must be a non-empty array',
        code: 'INVALID_POSITIONS_FORMAT'
      });
    }

    const spreadData = {
      user_id: userId,
      title: title.trim(),
      spread_type: spreadType,
      spread_name: spreadName,
      spread_name_en: spreadNameEn || spreadName,
      positions: positions,
      insights: insights || null,
      tags: tags || []
    };

    const { data: spread, error } = await supabase
      .from('spread_readings')
      .insert([spreadData])
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error);
      return res.status(500).json({
        error: 'Failed to save spread reading',
        code: 'DB_INSERT_ERROR'
      });
    }

    res.status(201).json({
      message: 'Spread reading saved successfully',
      spread: {
        id: spread.id,
        title: spread.title,
        spreadType: spread.spread_type,
        spreadName: spread.spread_name,
        spreadNameEn: spread.spread_name_en,
        positions: spread.positions,
        insights: spread.insights,
        tags: spread.tags,
        createdAt: spread.created_at,
        updatedAt: spread.updated_at
      }
    });

  } catch (error) {
    console.error('Save spread error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Update existing spread reading
const updateSpread = async (req, res) => {
  try {
    const userId = req.userId;
    const { spreadId } = req.params;
    const { title, insights, tags } = req.body;

    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(spreadId)) {
      return res.status(400).json({
        error: 'Invalid spread ID format',
        code: 'INVALID_ID_FORMAT'
      });
    }

    const updateData = {
      updated_at: new Date().toISOString()
    };

    // Only update provided fields
    if (title !== undefined) updateData.title = title.trim();
    if (insights !== undefined) updateData.insights = insights;
    if (tags !== undefined) updateData.tags = tags;

    const { data: spread, error } = await supabase
      .from('spread_readings')
      .update(updateData)
      .eq('user_id', userId)
      .eq('id', spreadId)
      .select()
      .single();

    if (error || !spread) {
      return res.status(404).json({
        error: 'Spread reading not found or update failed',
        code: 'UPDATE_FAILED'
      });
    }

    res.json({
      message: 'Spread reading updated successfully',
      spread: {
        id: spread.id,
        title: spread.title,
        spreadType: spread.spread_type,
        spreadName: spread.spread_name,
        spreadNameEn: spread.spread_name_en,
        positions: spread.positions,
        insights: spread.insights,
        tags: spread.tags,
        createdAt: spread.created_at,
        updatedAt: spread.updated_at
      }
    });

  } catch (error) {
    console.error('Update spread error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Delete spread reading
const deleteSpread = async (req, res) => {
  try {
    const userId = req.userId;
    const { spreadId } = req.params;

    // Validate UUID format
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(spreadId)) {
      return res.status(400).json({
        error: 'Invalid spread ID format',
        code: 'INVALID_ID_FORMAT'
      });
    }

    const { error } = await supabase
      .from('spread_readings')
      .delete()
      .eq('user_id', userId)
      .eq('id', spreadId);

    if (error) {
      console.error('Database delete error:', error);
      return res.status(500).json({
        error: 'Failed to delete spread reading',
        code: 'DB_DELETE_ERROR'
      });
    }

    res.json({
      message: 'Spread reading deleted successfully',
      spreadId
    });

  } catch (error) {
    console.error('Delete spread error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  getSpreads,
  getSpread,
  saveSpread,
  updateSpread,
  deleteSpread
};