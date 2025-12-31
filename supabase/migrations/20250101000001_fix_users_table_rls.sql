-- ============================================
-- public 스키마 모든 테이블 RLS 활성화 마이그레이션
-- 보안 경고 해결: RLS Disabled in Public
-- ============================================

-- 1. public.users 테이블이 존재하는 경우 RLS 활성화
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'users'
  ) THEN
    EXECUTE 'ALTER TABLE public.users ENABLE ROW LEVEL SECURITY';
    RAISE NOTICE 'RLS enabled on public.users table';
  ELSE
    RAISE NOTICE 'public.users table does not exist - no action needed';
  END IF;
END $$;

-- 1-1. public.daily_tarot_sessions 테이블 RLS 활성화
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'daily_tarot_sessions'
  ) THEN
    EXECUTE 'ALTER TABLE public.daily_tarot_sessions ENABLE ROW LEVEL SECURITY';
    RAISE NOTICE 'RLS enabled on public.daily_tarot_sessions table';
  ELSE
    RAISE NOTICE 'public.daily_tarot_sessions table does not exist - no action needed';
  END IF;
END $$;

-- 1-2. public.spread_readings 테이블 RLS 활성화
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'spread_readings'
  ) THEN
    EXECUTE 'ALTER TABLE public.spread_readings ENABLE ROW LEVEL SECURITY';
    RAISE NOTICE 'RLS enabled on public.spread_readings table';
  ELSE
    RAISE NOTICE 'public.spread_readings table does not exist - no action needed';
  END IF;
END $$;

-- 2. auth.users 테이블 RLS 확인 (Supabase Auth)
DO $$
BEGIN
  -- auth.users는 이미 Supabase가 관리하지만 명시적으로 확인
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'auth'
    AND tablename = 'users'
  ) THEN
    -- auth 스키마는 Supabase가 관리하므로 로그만 출력
    RAISE NOTICE 'auth.users table exists - managed by Supabase Auth';
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    -- auth 스키마 권한 없으면 무시
    RAISE NOTICE 'Insufficient privilege to check auth.users - Supabase manages this';
END $$;

-- 3. public.users가 존재하는 경우 기본 RLS 정책 추가
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'users'
  ) THEN
    -- 기존 정책 삭제 (있을 경우)
    DROP POLICY IF EXISTS "Users can view own data" ON public.users;
    DROP POLICY IF EXISTS "Users can update own data" ON public.users;

    -- 새로운 RLS 정책 생성
    CREATE POLICY "Users can view own data"
      ON public.users FOR SELECT
      USING (auth.uid() = id);

    CREATE POLICY "Users can update own data"
      ON public.users FOR UPDATE
      USING (auth.uid() = id);

    RAISE NOTICE 'RLS policies created for public.users';
  END IF;
END $$;

-- 4. daily_tarot_sessions RLS 정책 추가
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'daily_tarot_sessions'
  ) THEN
    -- 기존 정책 삭제 (있을 경우)
    DROP POLICY IF EXISTS "Users can view own daily sessions" ON public.daily_tarot_sessions;
    DROP POLICY IF EXISTS "Users can insert own daily sessions" ON public.daily_tarot_sessions;
    DROP POLICY IF EXISTS "Users can update own daily sessions" ON public.daily_tarot_sessions;
    DROP POLICY IF EXISTS "Users can delete own daily sessions" ON public.daily_tarot_sessions;

    -- 새로운 RLS 정책 생성 (user_id 컬럼 가정)
    EXECUTE 'CREATE POLICY "Users can view own daily sessions"
      ON public.daily_tarot_sessions FOR SELECT
      USING (auth.uid() = user_id)';

    EXECUTE 'CREATE POLICY "Users can insert own daily sessions"
      ON public.daily_tarot_sessions FOR INSERT
      WITH CHECK (auth.uid() = user_id)';

    EXECUTE 'CREATE POLICY "Users can update own daily sessions"
      ON public.daily_tarot_sessions FOR UPDATE
      USING (auth.uid() = user_id)';

    EXECUTE 'CREATE POLICY "Users can delete own daily sessions"
      ON public.daily_tarot_sessions FOR DELETE
      USING (auth.uid() = user_id)';

    RAISE NOTICE 'RLS policies created for public.daily_tarot_sessions';
  END IF;
EXCEPTION
  WHEN undefined_column THEN
    RAISE NOTICE 'daily_tarot_sessions table exists but user_id column not found - manual policy setup required';
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating policies for daily_tarot_sessions: %', SQLERRM;
END $$;

-- 5. spread_readings RLS 정책 추가
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'spread_readings'
  ) THEN
    -- 기존 정책 삭제 (있을 경우)
    DROP POLICY IF EXISTS "Users can view own spread readings" ON public.spread_readings;
    DROP POLICY IF EXISTS "Users can insert own spread readings" ON public.spread_readings;
    DROP POLICY IF EXISTS "Users can update own spread readings" ON public.spread_readings;
    DROP POLICY IF EXISTS "Users can delete own spread readings" ON public.spread_readings;

    -- 새로운 RLS 정책 생성 (user_id 컬럼 가정)
    EXECUTE 'CREATE POLICY "Users can view own spread readings"
      ON public.spread_readings FOR SELECT
      USING (auth.uid() = user_id)';

    EXECUTE 'CREATE POLICY "Users can insert own spread readings"
      ON public.spread_readings FOR INSERT
      WITH CHECK (auth.uid() = user_id)';

    EXECUTE 'CREATE POLICY "Users can update own spread readings"
      ON public.spread_readings FOR UPDATE
      USING (auth.uid() = user_id)';

    EXECUTE 'CREATE POLICY "Users can delete own spread readings"
      ON public.spread_readings FOR DELETE
      USING (auth.uid() = user_id)';

    RAISE NOTICE 'RLS policies created for public.spread_readings';
  END IF;
EXCEPTION
  WHEN undefined_column THEN
    RAISE NOTICE 'spread_readings table exists but user_id column not found - manual policy setup required';
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating policies for spread_readings: %', SQLERRM;
END $$;

-- 6. 보안 감사 로그
COMMENT ON SCHEMA public IS 'Public schema with RLS enabled on all user-facing tables';
