-- 타로 타이머 웹앱 관리자 전용 데이터베이스 스키마
-- 사용자 데이터는 로컬 저장, 익명 분석 데이터와 관리자 기능만 Supabase 사용

-- =============================================
-- 익명 분석 데이터 테이블 (개인정보 없음)
-- =============================================

-- 익명화된 앱 사용 통계 테이블
CREATE TABLE IF NOT EXISTS app_usage_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  app_version TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'web', 'ios', 'android'
  user_count_estimate INTEGER DEFAULT 1,
  session_count_estimate INTEGER DEFAULT 1,
  locale TEXT DEFAULT 'ko-KR',
  timezone TEXT,
  screen_size TEXT, -- 'small', 'medium', 'large'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 익명화된 이벤트 로그 테이블
CREATE TABLE IF NOT EXISTS anonymous_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_hash TEXT NOT NULL, -- 해시화된 세션 ID
  event_type TEXT NOT NULL, -- 'app_launch', 'tarot_session_complete' 등
  event_data JSONB DEFAULT '{}',
  device_info JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  app_version TEXT NOT NULL,
  platform TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 오류 로그 테이블 (익명화됨)
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  user_agent TEXT,
  app_version TEXT NOT NULL,
  platform TEXT NOT NULL,
  severity TEXT DEFAULT 'error', -- 'error', 'warning', 'critical'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사용자 피드백 테이블 (익명)
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug', 'feature', 'general')),
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  app_version TEXT NOT NULL,
  platform TEXT NOT NULL,
  user_locale TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 관리자 전용 테이블
-- =============================================

-- 관리자 계정 테이블
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 관리자 활동 로그
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'login', 'view_analytics', 'export_data' 등
  target_resource TEXT, -- 어떤 리소스에 접근했는지
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 미래 커뮤니티 기능 테이블 (계획)
-- =============================================

-- 커뮤니티 게시판 카테고리
CREATE TABLE IF NOT EXISTS board_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 커뮤니티 게시글 (익명 또는 닉네임 기반)
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES board_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_nickname TEXT, -- 익명 또는 닉네임 (실명 저장 안함)
  author_hash TEXT, -- 작성자 식별용 해시 (개인정보 아님)
  tags TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE, -- 관리자 승인 시스템
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'hidden', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 커뮤니티 댓글
CREATE TABLE IF NOT EXISTS community_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_nickname TEXT,
  author_hash TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 타로 카드 해석 데이터베이스 (커뮤니티 기여)
CREATE TABLE IF NOT EXISTS card_interpretations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_name TEXT NOT NULL,
  interpretation_type TEXT NOT NULL, -- 'upright', 'reversed', 'love', 'career' 등
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_nickname TEXT,
  author_hash TEXT,
  language TEXT DEFAULT 'ko',
  vote_score INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 인덱스 생성 (성능 최적화)
-- =============================================

-- 분석 데이터 인덱스
CREATE INDEX IF NOT EXISTS idx_app_usage_stats_timestamp
  ON app_usage_stats(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_anonymous_events_timestamp_type
  ON anonymous_events(timestamp DESC, event_type);

CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp_severity
  ON error_logs(timestamp DESC, severity);

CREATE INDEX IF NOT EXISTS idx_user_feedback_timestamp_type
  ON user_feedback(timestamp DESC, feedback_type);

-- 관리자 활동 인덱스
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_timestamp
  ON admin_activity_logs(admin_id, created_at DESC);

-- 커뮤니티 인덱스
CREATE INDEX IF NOT EXISTS idx_community_posts_category_status_created
  ON community_posts(category_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_comments_post_created
  ON community_comments(post_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_card_interpretations_card_type_approved
  ON card_interpretations(card_name, interpretation_type, is_approved);

-- =============================================
-- 트리거와 함수
-- =============================================

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거 적용
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_categories_updated_at
  BEFORE UPDATE ON board_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_comments_updated_at
  BEFORE UPDATE ON community_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_interpretations_updated_at
  BEFORE UPDATE ON card_interpretations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Row Level Security (RLS) 정책
-- =============================================

-- 익명 분석 데이터는 관리자만 조회 가능
ALTER TABLE app_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE anonymous_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- 관리자 테이블 RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- 커뮤니티 테이블 RLS
ALTER TABLE board_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_interpretations ENABLE ROW LEVEL SECURITY;

-- 관리자 정책 (서비스 키 사용 시에만 접근 가능)
CREATE POLICY "Admin only access for analytics"
  ON app_usage_stats FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Admin only access for events"
  ON anonymous_events FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Admin only access for error logs"
  ON error_logs FOR ALL
  USING (auth.role() = 'service_role');

-- 피드백은 익명 삽입 허용, 조회는 관리자만
CREATE POLICY "Anyone can insert feedback"
  ON user_feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin only read feedback"
  ON user_feedback FOR SELECT
  USING (auth.role() = 'service_role');

-- 커뮤니티 정책 (미래 구현)
CREATE POLICY "Public read for approved posts"
  ON community_posts FOR SELECT
  USING (status = 'published' AND is_approved = true);

CREATE POLICY "Anyone can create posts"
  ON community_posts FOR INSERT
  WITH CHECK (true);

-- =============================================
-- 분석 함수들
-- =============================================

-- 일일 활성 사용자 추정
CREATE OR REPLACE FUNCTION get_daily_active_users(target_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT session_hash)
  INTO user_count
  FROM anonymous_events
  WHERE DATE(timestamp) = target_date
    AND event_type = 'app_launch';

  RETURN COALESCE(user_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 인기 기능 분석
CREATE OR REPLACE FUNCTION get_popular_features(days_back INTEGER DEFAULT 7)
RETURNS TABLE(
  feature_name TEXT,
  usage_count BIGINT,
  unique_sessions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ae.event_type,
    COUNT(*) as usage_count,
    COUNT(DISTINCT ae.session_hash) as unique_sessions
  FROM anonymous_events ae
  WHERE ae.timestamp >= NOW() - INTERVAL '1 day' * days_back
  GROUP BY ae.event_type
  ORDER BY usage_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 오류 발생 현황
CREATE OR REPLACE FUNCTION get_error_summary(days_back INTEGER DEFAULT 7)
RETURNS TABLE(
  error_type TEXT,
  error_count BIGINT,
  severity_level TEXT,
  latest_occurrence TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    LEFT(el.error_message, 100) as error_type,
    COUNT(*) as error_count,
    el.severity,
    MAX(el.timestamp) as latest_occurrence
  FROM error_logs el
  WHERE el.timestamp >= NOW() - INTERVAL '1 day' * days_back
  GROUP BY LEFT(el.error_message, 100), el.severity
  ORDER BY error_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 초기 데이터 및 설정
-- =============================================

-- 기본 게시판 카테고리 추가 (미래 커뮤니티 기능)
INSERT INTO board_categories (name, description, slug, sort_order) VALUES
  ('일반 토론', '타로에 관한 자유로운 이야기', 'general', 1),
  ('카드 해석', '타로 카드 해석에 대한 토론', 'interpretations', 2),
  ('경험 공유', '타로 리딩 경험 나누기', 'experiences', 3),
  ('질문과 답변', '타로 관련 궁금한 점들', 'qna', 4),
  ('공지사항', '운영진 공지사항', 'announcements', 0)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- 뷰 생성 (관리자 대시보드용)
-- =============================================

-- 일일 통계 요약 뷰
CREATE OR REPLACE VIEW daily_stats_summary AS
SELECT
  DATE(timestamp) as date,
  COUNT(DISTINCT session_hash) as unique_sessions,
  COUNT(*) as total_events,
  COUNT(CASE WHEN event_type = 'app_launch' THEN 1 END) as app_launches,
  COUNT(CASE WHEN event_type = 'tarot_session_complete' THEN 1 END) as completed_sessions,
  COUNT(CASE WHEN event_type = 'journal_entry_add' THEN 1 END) as journal_entries
FROM anonymous_events
WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- 플랫폼별 통계 뷰
CREATE OR REPLACE VIEW platform_stats AS
SELECT
  platform,
  COUNT(DISTINCT session_hash) as unique_users,
  COUNT(*) as total_events,
  AVG(CASE WHEN event_data->>'session_duration_minutes' IS NOT NULL
      THEN (event_data->>'session_duration_minutes')::INTEGER END) as avg_session_minutes
FROM anonymous_events
WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY platform
ORDER BY unique_users DESC;

-- =============================================
-- 권한 설정
-- =============================================

-- 익명 사용자도 피드백 테이블에 INSERT 가능
GRANT INSERT ON user_feedback TO anon;
GRANT INSERT ON user_feedback TO authenticated;

-- 서비스 역할에 모든 권한 부여 (관리자 기능용)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 인증된 사용자는 커뮤니티 기능 사용 가능 (미래 기능)
GRANT SELECT, INSERT ON community_posts TO authenticated;
GRANT SELECT, INSERT ON community_comments TO authenticated;
GRANT SELECT, INSERT ON card_interpretations TO authenticated;
GRANT SELECT ON board_categories TO authenticated;
GRANT SELECT ON board_categories TO anon;