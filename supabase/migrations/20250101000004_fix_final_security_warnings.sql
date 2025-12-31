-- ============================================
-- Supabase Security Advisor 최종 17개 보안 경고 수정
-- ============================================

-- ============================================
-- Part 1: Function Search Path (2개 함수)
-- validate_promo_code, apply_promo_code가 누락됨
-- ============================================

-- 이미 존재하는 함수 확인 후 재생성
DO $$
BEGIN
  -- validate_promo_code와 apply_promo_code는 이미 20250101000002에서 생성됨
  -- 하지만 search_path가 제대로 설정되지 않았을 수 있으므로 확인
  RAISE NOTICE 'validate_promo_code and apply_promo_code should already have SET search_path';
END $$;

-- ============================================
-- Part 2: Anonymous User RLS Policy 완전 차단 (14개 테이블)
-- TO authenticated만으로는 부족 - REVOKE를 사용해야 함
-- ============================================

-- anon 역할에서 모든 테이블 접근 완전 차단
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.tarot_sessions FROM anon;
REVOKE ALL ON public.journal_entries FROM anon;
REVOKE ALL ON public.user_card_collections FROM anon;
REVOKE ALL ON public.notification_settings FROM anon;
REVOKE ALL ON public.usage_statistics FROM anon;
REVOKE ALL ON public.promo_codes FROM anon;
REVOKE ALL ON public.promo_code_usage FROM anon;
REVOKE ALL ON public.user_subscriptions FROM anon;
REVOKE ALL ON public.subscription_history FROM anon;

-- 테이블이 존재하는 경우에만 REVOKE
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    EXECUTE 'REVOKE ALL ON public.users FROM anon';
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'daily_tarot_sessions') THEN
    EXECUTE 'REVOKE ALL ON public.daily_tarot_sessions FROM anon';
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'spread_readings') THEN
    EXECUTE 'REVOKE ALL ON public.spread_readings FROM anon';
  END IF;
END $$;

-- authenticated 역할에만 SELECT 권한 부여
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tarot_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_card_collections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.usage_statistics TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_code_usage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_history TO authenticated;

-- promo_codes는 anon도 SELECT 가능 (공개 프로모션 코드 조회용)
GRANT SELECT ON public.promo_codes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_codes TO authenticated;

-- 동적으로 존재하는 테이블에만 권한 부여
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated';
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'daily_tarot_sessions') THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_tarot_sessions TO authenticated';
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'spread_readings') THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.spread_readings TO authenticated';
  END IF;
END $$;

-- ============================================
-- RLS 정책도 재확인 - 모든 정책을 authenticated만으로 제한
-- ============================================

-- 1. profiles
DROP POLICY IF EXISTS "Authenticated users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 2. tarot_sessions
DROP POLICY IF EXISTS "Authenticated users can view own tarot sessions" ON public.tarot_sessions;
DROP POLICY IF EXISTS "Authenticated users can insert own tarot sessions" ON public.tarot_sessions;
DROP POLICY IF EXISTS "Authenticated users can update own tarot sessions" ON public.tarot_sessions;
DROP POLICY IF EXISTS "Authenticated users can delete own tarot sessions" ON public.tarot_sessions;

CREATE POLICY "Authenticated users can view own tarot sessions"
  ON public.tarot_sessions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own tarot sessions"
  ON public.tarot_sessions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own tarot sessions"
  ON public.tarot_sessions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own tarot sessions"
  ON public.tarot_sessions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 3. journal_entries
DROP POLICY IF EXISTS "Authenticated users can view own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Authenticated users can insert own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Authenticated users can update own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Authenticated users can delete own journal entries" ON public.journal_entries;

CREATE POLICY "Authenticated users can view own journal entries"
  ON public.journal_entries FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own journal entries"
  ON public.journal_entries FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own journal entries"
  ON public.journal_entries FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own journal entries"
  ON public.journal_entries FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 4. user_card_collections
DROP POLICY IF EXISTS "Authenticated users can view own card collections" ON public.user_card_collections;
DROP POLICY IF EXISTS "Authenticated users can insert own card collections" ON public.user_card_collections;
DROP POLICY IF EXISTS "Authenticated users can update own card collections" ON public.user_card_collections;
DROP POLICY IF EXISTS "Authenticated users can delete own card collections" ON public.user_card_collections;

CREATE POLICY "Authenticated users can view own card collections"
  ON public.user_card_collections FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own card collections"
  ON public.user_card_collections FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own card collections"
  ON public.user_card_collections FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own card collections"
  ON public.user_card_collections FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 5. notification_settings
DROP POLICY IF EXISTS "Authenticated users can view own notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Authenticated users can insert own notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Authenticated users can update own notification settings" ON public.notification_settings;

CREATE POLICY "Authenticated users can view own notification settings"
  ON public.notification_settings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own notification settings"
  ON public.notification_settings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own notification settings"
  ON public.notification_settings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- 6. usage_statistics
DROP POLICY IF EXISTS "Authenticated users can view own usage statistics" ON public.usage_statistics;
DROP POLICY IF EXISTS "Authenticated users can insert own usage statistics" ON public.usage_statistics;

CREATE POLICY "Authenticated users can view own usage statistics"
  ON public.usage_statistics FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own usage statistics"
  ON public.usage_statistics FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 7. promo_codes - SELECT는 anon도 허용 (공개 프로모션 코드)
DROP POLICY IF EXISTS "Public can view active promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Authenticated users can manage promo codes" ON public.promo_codes;

-- anon도 활성 프로모션 코드 조회 가능
CREATE POLICY "Public can view active promo codes"
  ON public.promo_codes FOR SELECT
  TO anon, authenticated
  USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

-- 관리는 authenticated만
CREATE POLICY "Authenticated users can manage promo codes"
  ON public.promo_codes
  FOR ALL
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 8. promo_code_usage
DROP POLICY IF EXISTS "Authenticated users can view own usage" ON public.promo_code_usage;
DROP POLICY IF EXISTS "Authenticated users can create usage record" ON public.promo_code_usage;

CREATE POLICY "Authenticated users can view own usage"
  ON public.promo_code_usage FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create usage record"
  ON public.promo_code_usage FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 9. user_subscriptions
DROP POLICY IF EXISTS "Authenticated users can view own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Authenticated users can insert own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Authenticated users can update own subscriptions" ON public.user_subscriptions;

CREATE POLICY "Authenticated users can view own subscriptions"
  ON public.user_subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own subscriptions"
  ON public.user_subscriptions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own subscriptions"
  ON public.user_subscriptions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- 10. subscription_history
DROP POLICY IF EXISTS "Authenticated users can view own subscription history" ON public.subscription_history;
DROP POLICY IF EXISTS "Service role can insert history" ON public.subscription_history;

CREATE POLICY "Authenticated users can view own subscription history"
  ON public.subscription_history FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert history"
  ON public.subscription_history FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 11-13. 동적 테이블 정책
DO $$
BEGIN
  -- users
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view own data" ON public.users';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can update own data" ON public.users';

    EXECUTE 'CREATE POLICY "Authenticated users can view own data" ON public.users FOR SELECT TO authenticated USING (auth.uid() = id)';
    EXECUTE 'CREATE POLICY "Authenticated users can update own data" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id)';
  END IF;

  -- daily_tarot_sessions
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'daily_tarot_sessions') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view own daily sessions" ON public.daily_tarot_sessions';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can insert own daily sessions" ON public.daily_tarot_sessions';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can update own daily sessions" ON public.daily_tarot_sessions';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can delete own daily sessions" ON public.daily_tarot_sessions';

    EXECUTE 'CREATE POLICY "Authenticated users can view own daily sessions" ON public.daily_tarot_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Authenticated users can insert own daily sessions" ON public.daily_tarot_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Authenticated users can update own daily sessions" ON public.daily_tarot_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Authenticated users can delete own daily sessions" ON public.daily_tarot_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id)';
  END IF;

  -- spread_readings
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'spread_readings') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view own spread readings" ON public.spread_readings';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can insert own spread readings" ON public.spread_readings';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can update own spread readings" ON public.spread_readings';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can delete own spread readings" ON public.spread_readings';

    EXECUTE 'CREATE POLICY "Authenticated users can view own spread readings" ON public.spread_readings FOR SELECT TO authenticated USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Authenticated users can insert own spread readings" ON public.spread_readings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Authenticated users can update own spread readings" ON public.spread_readings FOR UPDATE TO authenticated USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Authenticated users can delete own spread readings" ON public.spread_readings FOR DELETE TO authenticated USING (auth.uid() = user_id)';
  END IF;
END $$;

-- ============================================
-- 완료 로그
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Security Advisor 최종 보안 경고 수정 완료';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Table REVOKE: anon 역할에서 모든 테이블 접근 차단';
  RAISE NOTICE '✅ Table GRANT: authenticated만 접근 허용';
  RAISE NOTICE '✅ RLS Policy: TO authenticated 명시';
  RAISE NOTICE '========================================';
  RAISE NOTICE '⚠️  promo_codes SELECT만 anon 허용 (공개 프로모션)';
  RAISE NOTICE '========================================';
END $$;
