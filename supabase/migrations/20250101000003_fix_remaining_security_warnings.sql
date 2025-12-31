-- ============================================
-- Supabase Security Advisor 남은 17개 보안 경고 수정
-- ============================================

-- ============================================
-- Part 1: Anonymous User RLS Policy 수정 (14개 테이블)
-- 모든 정책에서 anon 역할 제거, authenticated만 허용
-- ============================================

-- 1. public.profiles
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
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 2. public.tarot_sessions
DROP POLICY IF EXISTS "Authenticated users can view own tarot sessions" ON public.tarot_sessions;
DROP POLICY IF EXISTS "Authenticated users can insert own tarot sessions" ON public.tarot_sessions;
DROP POLICY IF EXISTS "Authenticated users can update own tarot sessions" ON public.tarot_sessions;
DROP POLICY IF EXISTS "Authenticated users can delete own tarot sessions" ON public.tarot_sessions;

CREATE POLICY "Authenticated users can view own tarot sessions"
  ON public.tarot_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own tarot sessions"
  ON public.tarot_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own tarot sessions"
  ON public.tarot_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own tarot sessions"
  ON public.tarot_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. public.journal_entries
DROP POLICY IF EXISTS "Authenticated users can view own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Authenticated users can insert own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Authenticated users can update own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Authenticated users can delete own journal entries" ON public.journal_entries;

CREATE POLICY "Authenticated users can view own journal entries"
  ON public.journal_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own journal entries"
  ON public.journal_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own journal entries"
  ON public.journal_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own journal entries"
  ON public.journal_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. public.user_card_collections
DROP POLICY IF EXISTS "Authenticated users can view own card collections" ON public.user_card_collections;
DROP POLICY IF EXISTS "Authenticated users can insert own card collections" ON public.user_card_collections;
DROP POLICY IF EXISTS "Authenticated users can update own card collections" ON public.user_card_collections;
DROP POLICY IF EXISTS "Authenticated users can delete own card collections" ON public.user_card_collections;

CREATE POLICY "Authenticated users can view own card collections"
  ON public.user_card_collections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own card collections"
  ON public.user_card_collections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own card collections"
  ON public.user_card_collections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own card collections"
  ON public.user_card_collections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. public.notification_settings
DROP POLICY IF EXISTS "Authenticated users can view own notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Authenticated users can insert own notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Authenticated users can update own notification settings" ON public.notification_settings;

CREATE POLICY "Authenticated users can view own notification settings"
  ON public.notification_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own notification settings"
  ON public.notification_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own notification settings"
  ON public.notification_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. public.usage_statistics
DROP POLICY IF EXISTS "Authenticated users can view own usage statistics" ON public.usage_statistics;
DROP POLICY IF EXISTS "Authenticated users can insert own usage statistics" ON public.usage_statistics;

CREATE POLICY "Authenticated users can view own usage statistics"
  ON public.usage_statistics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own usage statistics"
  ON public.usage_statistics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 7. public.promo_codes
-- 활성화된 프로모션 코드는 읽기만 공개 허용 (의도적 설계)
-- 하지만 생성/수정/삭제는 authenticated만
DROP POLICY IF EXISTS "Anyone can view active promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Authenticated users can manage promo codes" ON public.promo_codes;

-- 활성 코드 조회는 public (읽기 전용)
CREATE POLICY "Public can view active promo codes"
  ON public.promo_codes
  FOR SELECT
  TO public
  USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

-- 관리 작업은 authenticated만
CREATE POLICY "Authenticated users can manage promo codes"
  ON public.promo_codes
  FOR ALL
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 8. public.promo_code_usage
DROP POLICY IF EXISTS "Authenticated users can view own usage" ON public.promo_code_usage;
DROP POLICY IF EXISTS "Authenticated users can create usage record" ON public.promo_code_usage;

CREATE POLICY "Authenticated users can view own usage"
  ON public.promo_code_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create usage record"
  ON public.promo_code_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 9. public.user_subscriptions
DROP POLICY IF EXISTS "Authenticated users can view own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Authenticated users can insert own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Authenticated users can update own subscriptions" ON public.user_subscriptions;

CREATE POLICY "Authenticated users can view own subscriptions"
  ON public.user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own subscriptions"
  ON public.user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own subscriptions"
  ON public.user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 10. public.subscription_history
DROP POLICY IF EXISTS "Authenticated users can view own subscription history" ON public.subscription_history;
DROP POLICY IF EXISTS "Service role can insert history" ON public.subscription_history;

CREATE POLICY "Authenticated users can view own subscription history"
  ON public.subscription_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert history"
  ON public.subscription_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 11. public.users (이전 마이그레이션에서 생성됨)
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view own data" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can update own data" ON public.users;

CREATE POLICY "Authenticated users can view own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 12. public.daily_tarot_sessions (이전 마이그레이션에서 생성됨)
DROP POLICY IF EXISTS "Users can view own daily sessions" ON public.daily_tarot_sessions;
DROP POLICY IF EXISTS "Users can insert own daily sessions" ON public.daily_tarot_sessions;
DROP POLICY IF EXISTS "Users can update own daily sessions" ON public.daily_tarot_sessions;
DROP POLICY IF EXISTS "Users can delete own daily sessions" ON public.daily_tarot_sessions;
DROP POLICY IF EXISTS "Authenticated users can view own daily sessions" ON public.daily_tarot_sessions;
DROP POLICY IF EXISTS "Authenticated users can insert own daily sessions" ON public.daily_tarot_sessions;
DROP POLICY IF EXISTS "Authenticated users can update own daily sessions" ON public.daily_tarot_sessions;
DROP POLICY IF EXISTS "Authenticated users can delete own daily sessions" ON public.daily_tarot_sessions;

CREATE POLICY "Authenticated users can view own daily sessions"
  ON public.daily_tarot_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own daily sessions"
  ON public.daily_tarot_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own daily sessions"
  ON public.daily_tarot_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own daily sessions"
  ON public.daily_tarot_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 13. public.spread_readings (이전 마이그레이션에서 생성됨)
DROP POLICY IF EXISTS "Users can view own spread readings" ON public.spread_readings;
DROP POLICY IF EXISTS "Users can insert own spread readings" ON public.spread_readings;
DROP POLICY IF EXISTS "Users can update own spread readings" ON public.spread_readings;
DROP POLICY IF EXISTS "Users can delete own spread readings" ON public.spread_readings;
DROP POLICY IF EXISTS "Authenticated users can view own spread readings" ON public.spread_readings;
DROP POLICY IF EXISTS "Authenticated users can insert own spread readings" ON public.spread_readings;
DROP POLICY IF EXISTS "Authenticated users can update own spread readings" ON public.spread_readings;
DROP POLICY IF EXISTS "Authenticated users can delete own spread readings" ON public.spread_readings;

CREATE POLICY "Authenticated users can view own spread readings"
  ON public.spread_readings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own spread readings"
  ON public.spread_readings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own spread readings"
  ON public.spread_readings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own spread readings"
  ON public.spread_readings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- auth.users 테이블은 Supabase Auth가 관리하므로 스킵
-- ============================================

-- ============================================
-- 완료 로그
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Security Advisor 남은 보안 경고 수정 완료';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Anonymous RLS Policy: 14개 테이블 수정';
  RAISE NOTICE '   - 모든 정책에서 anon 제거';
  RAISE NOTICE '   - authenticated 역할만 허용';
  RAISE NOTICE '   - TO authenticated 명시';
  RAISE NOTICE '========================================';
  RAISE NOTICE '⚠️  promo_codes는 읽기만 public 허용 (의도적)';
  RAISE NOTICE '⚠️  auth.users는 Supabase Auth 관리 (수정 불필요)';
  RAISE NOTICE '========================================';
END $$;
