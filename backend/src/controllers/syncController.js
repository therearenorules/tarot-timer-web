const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get sync status and metadata
const getSyncStatus = async (req, res) => {
  try {
    const userId = req.userId;

    // Get counts from different tables
    const [dailySessionsResult, spreadsResult, userResult] = await Promise.all([
      supabase.from('daily_tarot_sessions').select('*', { count: 'exact' }).eq('user_id', userId),
      supabase.from('spread_readings').select('*', { count: 'exact' }).eq('user_id', userId),
      supabase.from('users').select('total_sessions, last_active').eq('id', userId).single()
    ]);

    const syncStatus = {
      userId,
      lastSyncTime: new Date().toISOString(),
      dataStats: {
        dailySessions: {
          count: dailySessionsResult.count || 0,
          lastModified: dailySessionsResult.data?.length > 0
            ? dailySessionsResult.data[0]?.updated_at
            : null
        },
        spreadReadings: {
          count: spreadsResult.count || 0,
          lastModified: spreadsResult.data?.length > 0
            ? spreadsResult.data[0]?.updated_at
            : null
        },
        user: {
          totalSessions: userResult.data?.total_sessions || 0,
          lastActive: userResult.data?.last_active
        }
      },
      serverTime: new Date().toISOString(),
      status: 'healthy'
    };

    res.json(syncStatus);

  } catch (error) {
    console.error('Get sync status error:', error);
    res.status(500).json({
      error: 'Failed to get sync status',
      code: 'SYNC_STATUS_ERROR'
    });
  }
};

// Bulk data export for full sync
const exportUserData = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all user data in parallel
    const [dailySessionsResult, spreadsResult, userResult] = await Promise.all([
      supabase
        .from('daily_tarot_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false }),
      supabase
        .from('spread_readings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
    ]);

    if (dailySessionsResult.error || spreadsResult.error || userResult.error) {
      console.error('Export data errors:', {
        daily: dailySessionsResult.error,
        spreads: spreadsResult.error,
        user: userResult.error
      });
      return res.status(500).json({
        error: 'Failed to export user data',
        code: 'EXPORT_ERROR'
      });
    }

    // Format data for frontend compatibility
    const exportData = {
      user: {
        id: userResult.data.id,
        email: userResult.data.email,
        language: userResult.data.language,
        timezone: userResult.data.timezone,
        subscriptionStatus: userResult.data.subscription_status,
        trialEndDate: userResult.data.trial_end_date,
        totalSessions: userResult.data.total_sessions,
        lastActive: userResult.data.last_active,
        createdAt: userResult.data.created_at
      },
      dailySessions: dailySessionsResult.data.map(session => ({
        date: session.date,
        cards: session.cards,
        memos: session.memos || {},
        insights: session.insights,
        createdAt: session.created_at,
        updatedAt: session.updated_at,
        id: session.id
      })),
      spreadReadings: spreadsResult.data.map(spread => ({
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
      })),
      metadata: {
        exportedAt: new Date().toISOString(),
        totalDailySessions: dailySessionsResult.data.length,
        totalSpreadReadings: spreadsResult.data.length,
        dataVersion: '1.0'
      }
    };

    res.json(exportData);

  } catch (error) {
    console.error('Export user data error:', error);
    res.status(500).json({
      error: 'Internal server error during data export',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Bulk data import for full sync
const importUserData = async (req, res) => {
  try {
    const userId = req.userId;
    const { dailySessions, spreadReadings, mergeStrategy = 'replace' } = req.body;

    if (!dailySessions && !spreadReadings) {
      return res.status(400).json({
        error: 'At least one of dailySessions or spreadReadings is required',
        code: 'MISSING_DATA'
      });
    }

    const results = {
      dailySessions: { imported: 0, skipped: 0, errors: 0 },
      spreadReadings: { imported: 0, skipped: 0, errors: 0 }
    };

    // Import daily sessions
    if (dailySessions && Array.isArray(dailySessions)) {
      for (const session of dailySessions) {
        try {
          const sessionData = {
            user_id: userId,
            date: session.date,
            cards: session.cards,
            memos: session.memos || {},
            insights: session.insights || null,
            created_at: session.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { error } = await supabase
            .from('daily_tarot_sessions')
            .upsert(sessionData, {
              onConflict: 'user_id,date'
            });

          if (error) {
            console.error('Daily session import error:', error);
            results.dailySessions.errors++;
          } else {
            results.dailySessions.imported++;
          }
        } catch (err) {
          console.error('Daily session processing error:', err);
          results.dailySessions.errors++;
        }
      }
    }

    // Import spread readings
    if (spreadReadings && Array.isArray(spreadReadings)) {
      for (const spread of spreadReadings) {
        try {
          const spreadData = {
            user_id: userId,
            title: spread.title,
            spread_type: spread.spreadType,
            spread_name: spread.spreadName,
            spread_name_en: spread.spreadNameEn || spread.spreadName,
            positions: spread.positions,
            insights: spread.insights || null,
            tags: spread.tags || [],
            created_at: spread.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { error } = await supabase
            .from('spread_readings')
            .insert([spreadData]);

          if (error) {
            console.error('Spread reading import error:', error);
            results.spreadReadings.errors++;
          } else {
            results.spreadReadings.imported++;
          }
        } catch (err) {
          console.error('Spread reading processing error:', err);
          results.spreadReadings.errors++;
        }
      }
    }

    res.json({
      message: 'Data import completed',
      results,
      importedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Import user data error:', error);
    res.status(500).json({
      error: 'Internal server error during data import',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Clear all user data (for reset functionality)
const clearUserData = async (req, res) => {
  try {
    const userId = req.userId;
    const { confirm } = req.body;

    if (confirm !== 'DELETE_ALL_DATA') {
      return res.status(400).json({
        error: 'Confirmation required. Send {"confirm": "DELETE_ALL_DATA"} to proceed.',
        code: 'CONFIRMATION_REQUIRED'
      });
    }

    // Delete all user data in parallel
    const [dailyResult, spreadsResult] = await Promise.all([
      supabase.from('daily_tarot_sessions').delete().eq('user_id', userId),
      supabase.from('spread_readings').delete().eq('user_id', userId)
    ]);

    if (dailyResult.error || spreadsResult.error) {
      console.error('Clear data errors:', {
        daily: dailyResult.error,
        spreads: spreadsResult.error
      });
      return res.status(500).json({
        error: 'Failed to clear user data',
        code: 'CLEAR_ERROR'
      });
    }

    res.json({
      message: 'All user data cleared successfully',
      clearedAt: new Date().toISOString(),
      deletedRecords: {
        dailySessions: dailyResult.count || 0,
        spreadReadings: spreadsResult.count || 0
      }
    });

  } catch (error) {
    console.error('Clear user data error:', error);
    res.status(500).json({
      error: 'Internal server error during data clearing',
      code: 'INTERNAL_ERROR'
    });
  }
};

module.exports = {
  getSyncStatus,
  exportUserData,
  importUserData,
  clearUserData
};