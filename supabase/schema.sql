-- 타로 타이머 웹앱 데이터베이스 스키마
-- Supabase용 PostgreSQL 스키마 정의

-- 사용자 프로필 테이블 (Supabase Auth 확장)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'Asia/Seoul',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 프로필 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 타로 세션 테이블
CREATE TABLE IF NOT EXISTS tarot_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('daily', 'spread', 'custom')),
  spread_type TEXT, -- 'celtic_cross', 'three_card', 'past_present_future' 등
  cards_drawn JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  duration INTEGER, -- 세션 지속 시간 (초)
  mood_before TEXT,
  mood_after TEXT,
  insights JSONB DEFAULT '{}',
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_tarot_sessions_updated_at
  BEFORE UPDATE ON tarot_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 저널 엔트리 테이블
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT[] DEFAULT '{}',
  related_session_id UUID REFERENCES tarot_sessions(id),
  is_private BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 카드 컬렉션 테이블 (사용자별 카드 즐겨찾기 등)
CREATE TABLE IF NOT EXISTS user_card_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  card_name TEXT NOT NULL,
  card_suit TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  draw_count INTEGER DEFAULT 0,
  last_drawn_at TIMESTAMPTZ,
  personal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, card_name)
);

CREATE TRIGGER update_user_card_collections_updated_at
  BEFORE UPDATE ON user_card_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 알림 설정 테이블
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  daily_reminder BOOLEAN DEFAULT TRUE,
  reminder_time TIME DEFAULT '09:00:00',
  push_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT FALSE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  vibration_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 앱 사용 통계 테이블
CREATE TABLE IF NOT EXISTS usage_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'session_start', 'card_draw', 'journal_write' 등
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) 정책 설정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_card_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_statistics ENABLE ROW LEVEL SECURITY;

-- 프로필 RLS 정책
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 타로 세션 RLS 정책
CREATE POLICY "Users can view own tarot sessions"
  ON tarot_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tarot sessions"
  ON tarot_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tarot sessions"
  ON tarot_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tarot sessions"
  ON tarot_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- 저널 엔트리 RLS 정책
CREATE POLICY "Users can view own journal entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- 카드 컬렉션 RLS 정책
CREATE POLICY "Users can view own card collections"
  ON user_card_collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own card collections"
  ON user_card_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own card collections"
  ON user_card_collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own card collections"
  ON user_card_collections FOR DELETE
  USING (auth.uid() = user_id);

-- 알림 설정 RLS 정책
CREATE POLICY "Users can view own notification settings"
  ON notification_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings"
  ON notification_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings"
  ON notification_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- 사용 통계 RLS 정책
CREATE POLICY "Users can view own usage statistics"
  ON usage_statistics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage statistics"
  ON usage_statistics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_tarot_sessions_user_id_created_at
  ON tarot_sessions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id_created_at
  ON journal_entries(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_card_collections_user_id_card_name
  ON user_card_collections(user_id, card_name);

CREATE INDEX IF NOT EXISTS idx_usage_statistics_user_id_created_at
  ON usage_statistics(user_id, created_at DESC);

-- 함수: 새 사용자 프로필 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');

  INSERT INTO public.notification_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거: 새 사용자 등록 시 프로필 자동 생성
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 함수: 타로 세션 완료 시 카드 컬렉션 업데이트
CREATE OR REPLACE FUNCTION update_card_collection_on_session()
RETURNS TRIGGER AS $$
DECLARE
  card_data JSONB;
  card_name TEXT;
BEGIN
  -- 세션이 완료되었을 때만 실행
  IF NEW.is_completed = TRUE AND (OLD.is_completed IS NULL OR OLD.is_completed = FALSE) THEN
    -- 뽑은 카드들을 순회하며 컬렉션 업데이트
    FOR card_data IN SELECT jsonb_array_elements(NEW.cards_drawn)
    LOOP
      card_name := card_data->>'name';

      INSERT INTO user_card_collections (user_id, card_name, draw_count, last_drawn_at)
      VALUES (NEW.user_id, card_name, 1, NOW())
      ON CONFLICT (user_id, card_name)
      DO UPDATE SET
        draw_count = user_card_collections.draw_count + 1,
        last_drawn_at = NOW(),
        updated_at = NOW();
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_card_collection_trigger
  AFTER UPDATE ON tarot_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_card_collection_on_session();

-- 함수: 사용 통계 기록
CREATE OR REPLACE FUNCTION log_usage_statistic(
  user_uuid UUID,
  action TEXT,
  meta JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO usage_statistics (user_id, action_type, metadata)
  VALUES (user_uuid, action, meta);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 뷰: 사용자 대시보드 데이터
CREATE OR REPLACE VIEW user_dashboard AS
SELECT
  p.id as user_id,
  p.full_name,
  COUNT(ts.id) as total_sessions,
  COUNT(CASE WHEN ts.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as sessions_this_week,
  COUNT(CASE WHEN ts.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as sessions_this_month,
  COUNT(je.id) as total_journal_entries,
  COUNT(CASE WHEN je.created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as journal_entries_this_week,
  MAX(ts.created_at) as last_session_date,
  COUNT(DISTINCT (ts.cards_drawn->0->>'name')) as unique_cards_drawn
FROM profiles p
LEFT JOIN tarot_sessions ts ON p.id = ts.user_id
LEFT JOIN journal_entries je ON p.id = je.user_id
GROUP BY p.id, p.full_name;

-- RLS for view
CREATE POLICY "Users can view own dashboard"
  ON user_dashboard FOR SELECT
  USING (auth.uid() = user_id);

-- 샘플 데이터 삽입 (개발용)
-- 실제 운영에서는 이 부분을 제거해야 합니다
/*
INSERT INTO profiles (id, email, full_name) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'demo@tarottimer.com', '데모 사용자')
  ON CONFLICT (id) DO NOTHING;

INSERT INTO notification_settings (user_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440000')
  ON CONFLICT (user_id) DO NOTHING;
*/