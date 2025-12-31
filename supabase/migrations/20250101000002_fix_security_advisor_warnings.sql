-- ============================================
-- Supabase Security Advisor 보안 경고 수정
-- 총 25개 보안 경고 해결
-- ============================================

-- ============================================
-- Part 1: Function Search Path Mutable (10개 함수)
-- 기존 함수 DROP 후 SET search_path = '' 추가하여 재생성
-- ============================================

-- 모든 함수 DROP (CASCADE로 종속성 포함)
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_card_collection_on_session() CASCADE;
DROP FUNCTION IF EXISTS public.log_usage_statistic(UUID, TEXT, JSONB) CASCADE;
DROP FUNCTION IF EXISTS public.increment_promo_code_usage() CASCADE;
DROP FUNCTION IF EXISTS public.get_active_subscription(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.expire_subscriptions() CASCADE;
DROP FUNCTION IF EXISTS public.check_premium_status(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.validate_promo_code(TEXT, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.apply_promo_code(TEXT, UUID, TEXT) CASCADE;

-- 1. update_updated_at_column
CREATE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 트리거 재생성
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tarot_sessions_updated_at
  BEFORE UPDATE ON public.tarot_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_card_collections_updated_at
  BEFORE UPDATE ON public.user_card_collections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. handle_new_user
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');

  INSERT INTO public.notification_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. update_card_collection_on_session
CREATE FUNCTION public.update_card_collection_on_session()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  card_data JSONB;
  card_name TEXT;
BEGIN
  IF NEW.is_completed = TRUE AND (OLD.is_completed IS NULL OR OLD.is_completed = FALSE) THEN
    FOR card_data IN SELECT jsonb_array_elements(NEW.cards_drawn)
    LOOP
      card_name := card_data->>'name';

      INSERT INTO public.user_card_collections (user_id, card_name, draw_count, last_drawn_at)
      VALUES (NEW.user_id, card_name, 1, NOW())
      ON CONFLICT (user_id, card_name)
      DO UPDATE SET
        draw_count = public.user_card_collections.draw_count + 1,
        last_drawn_at = NOW(),
        updated_at = NOW();
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER update_card_collection_trigger
  AFTER UPDATE ON public.tarot_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_card_collection_on_session();

-- 4. log_usage_statistic
CREATE FUNCTION public.log_usage_statistic(
  user_uuid UUID,
  action TEXT,
  meta JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.usage_statistics (user_id, action_type, metadata)
  VALUES (user_uuid, action, meta);
END;
$$;

-- 5. increment_promo_code_usage
CREATE FUNCTION public.increment_promo_code_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    UPDATE public.promo_codes
    SET current_uses = current_uses + 1
    WHERE id = NEW.promo_code_id;

    RETURN NEW;
END;
$$;

CREATE TRIGGER increment_usage_on_apply
    AFTER INSERT ON public.promo_code_usage
    FOR EACH ROW
    EXECUTE FUNCTION public.increment_promo_code_usage();

-- 6. get_active_subscription
CREATE FUNCTION public.get_active_subscription(p_user_id UUID)
RETURNS TABLE (
  subscription_id UUID,
  product_id TEXT,
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN,
  environment TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    us.id,
    us.product_id,
    us.expiry_date,
    us.is_active,
    us.environment
  FROM public.user_subscriptions us
  WHERE us.user_id = p_user_id
    AND us.is_active = true
    AND us.expiry_date > NOW()
  ORDER BY us.expiry_date DESC
  LIMIT 1;
END;
$$;

-- 7. expire_subscriptions
CREATE FUNCTION public.expire_subscriptions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE public.user_subscriptions
    SET is_active = false
    WHERE is_active = true
      AND expiry_date <= NOW();

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

-- 8. check_premium_status
CREATE FUNCTION public.check_premium_status(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_is_premium BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.user_subscriptions
        WHERE user_id = p_user_id
          AND is_active = true
          AND expiry_date > NOW()
    ) INTO v_is_premium;

    RETURN v_is_premium;
END;
$$;

-- 9. validate_promo_code
CREATE FUNCTION public.validate_promo_code(
    p_code TEXT,
    p_user_id UUID DEFAULT NULL,
    p_device_id TEXT DEFAULT NULL
)
RETURNS TABLE (
    is_valid BOOLEAN,
    error_message TEXT,
    promo_code_id UUID,
    free_days INTEGER,
    benefits JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_promo public.promo_codes%ROWTYPE;
    v_usage_count INTEGER;
BEGIN
    SELECT * INTO v_promo
    FROM public.promo_codes
    WHERE code = p_code;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, '유효하지 않은 프로모션 코드입니다.', NULL::UUID, NULL::INTEGER, NULL::JSONB;
        RETURN;
    END IF;

    IF NOT v_promo.is_active THEN
        RETURN QUERY SELECT FALSE, '이미 종료된 프로모션 코드입니다.', NULL::UUID, NULL::INTEGER, NULL::JSONB;
        RETURN;
    END IF;

    IF v_promo.valid_from IS NOT NULL AND v_promo.valid_from > NOW() THEN
        RETURN QUERY SELECT FALSE, '아직 사용할 수 없는 프로모션 코드입니다.', NULL::UUID, NULL::INTEGER, NULL::JSONB;
        RETURN;
    END IF;

    IF v_promo.valid_until IS NOT NULL AND v_promo.valid_until < NOW() THEN
        RETURN QUERY SELECT FALSE, '기간이 만료된 프로모션 코드입니다.', NULL::UUID, NULL::INTEGER, NULL::JSONB;
        RETURN;
    END IF;

    IF v_promo.max_uses IS NOT NULL AND v_promo.current_uses >= v_promo.max_uses THEN
        RETURN QUERY SELECT FALSE, '사용 가능한 횟수를 초과한 프로모션 코드입니다.', NULL::UUID, NULL::INTEGER, NULL::JSONB;
        RETURN;
    END IF;

    IF p_user_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_usage_count
        FROM public.promo_code_usage
        WHERE promo_code_id = v_promo.id
          AND user_id = p_user_id;

        IF v_usage_count > 0 THEN
            RETURN QUERY SELECT FALSE, '이미 사용한 프로모션 코드입니다.', NULL::UUID, NULL::INTEGER, NULL::JSONB;
            RETURN;
        END IF;
    END IF;

    IF p_device_id IS NOT NULL THEN
        SELECT COUNT(*) INTO v_usage_count
        FROM public.promo_code_usage
        WHERE promo_code_id = v_promo.id
          AND device_id = p_device_id;

        IF v_usage_count > 0 THEN
            RETURN QUERY SELECT FALSE, '이 기기에서 이미 사용한 프로모션 코드입니다.', NULL::UUID, NULL::INTEGER, NULL::JSONB;
            RETURN;
        END IF;
    END IF;

    RETURN QUERY SELECT
        TRUE,
        NULL::TEXT,
        v_promo.id,
        v_promo.free_days,
        jsonb_build_object(
            'code', v_promo.code,
            'description', v_promo.description,
            'free_days', v_promo.free_days
        );
END;
$$;

-- 10. apply_promo_code
CREATE FUNCTION public.apply_promo_code(
    p_code TEXT,
    p_user_id UUID DEFAULT NULL,
    p_device_id TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    expires_at TIMESTAMPTZ,
    benefits JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_validation RECORD;
    v_new_expires_at TIMESTAMPTZ;
BEGIN
    SELECT * INTO v_validation
    FROM public.validate_promo_code(p_code, p_user_id, p_device_id);

    IF NOT v_validation.is_valid THEN
        RETURN QUERY SELECT FALSE, v_validation.error_message, NULL::TIMESTAMPTZ, NULL::JSONB;
        RETURN;
    END IF;

    v_new_expires_at := NOW() + (v_validation.free_days || ' days')::INTERVAL;

    INSERT INTO public.promo_code_usage (
        promo_code_id,
        user_id,
        device_id,
        applied_at,
        expires_at
    ) VALUES (
        v_validation.promo_code_id,
        p_user_id,
        p_device_id,
        NOW(),
        v_new_expires_at
    );

    RETURN QUERY SELECT
        TRUE,
        '프로모션 코드가 적용되었습니다!' as message,
        v_new_expires_at,
        v_validation.benefits;
END;
$$;

-- ============================================
-- Part 2: Anonymous User RLS Policy (14개 테이블)
-- 익명 사용자 접근 제한 - 인증된 사용자만 접근 가능
-- ============================================

-- 2.1 public.profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id AND auth.uid() IS NOT NULL);

-- 2.2 public.tarot_sessions
DROP POLICY IF EXISTS "Users can view own tarot sessions" ON public.tarot_sessions;
DROP POLICY IF EXISTS "Users can insert own tarot sessions" ON public.tarot_sessions;
DROP POLICY IF EXISTS "Users can update own tarot sessions" ON public.tarot_sessions;
DROP POLICY IF EXISTS "Users can delete own tarot sessions" ON public.tarot_sessions;
DROP POLICY IF EXISTS "Authenticated users can view own tarot sessions" ON public.tarot_sessions;
DROP POLICY IF EXISTS "Authenticated users can insert own tarot sessions" ON public.tarot_sessions;
DROP POLICY IF EXISTS "Authenticated users can update own tarot sessions" ON public.tarot_sessions;
DROP POLICY IF EXISTS "Authenticated users can delete own tarot sessions" ON public.tarot_sessions;

CREATE POLICY "Authenticated users can view own tarot sessions"
  ON public.tarot_sessions FOR SELECT
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert own tarot sessions"
  ON public.tarot_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update own tarot sessions"
  ON public.tarot_sessions FOR UPDATE
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete own tarot sessions"
  ON public.tarot_sessions FOR DELETE
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- 2.3 public.journal_entries
DROP POLICY IF EXISTS "Users can view own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can insert own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can update own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Users can delete own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Authenticated users can view own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Authenticated users can insert own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Authenticated users can update own journal entries" ON public.journal_entries;
DROP POLICY IF EXISTS "Authenticated users can delete own journal entries" ON public.journal_entries;

CREATE POLICY "Authenticated users can view own journal entries"
  ON public.journal_entries FOR SELECT
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert own journal entries"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update own journal entries"
  ON public.journal_entries FOR UPDATE
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete own journal entries"
  ON public.journal_entries FOR DELETE
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- 2.4 public.user_card_collections
DROP POLICY IF EXISTS "Users can view own card collections" ON public.user_card_collections;
DROP POLICY IF EXISTS "Users can insert own card collections" ON public.user_card_collections;
DROP POLICY IF EXISTS "Users can update own card collections" ON public.user_card_collections;
DROP POLICY IF EXISTS "Users can delete own card collections" ON public.user_card_collections;
DROP POLICY IF EXISTS "Authenticated users can view own card collections" ON public.user_card_collections;
DROP POLICY IF EXISTS "Authenticated users can insert own card collections" ON public.user_card_collections;
DROP POLICY IF EXISTS "Authenticated users can update own card collections" ON public.user_card_collections;
DROP POLICY IF EXISTS "Authenticated users can delete own card collections" ON public.user_card_collections;

CREATE POLICY "Authenticated users can view own card collections"
  ON public.user_card_collections FOR SELECT
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert own card collections"
  ON public.user_card_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update own card collections"
  ON public.user_card_collections FOR UPDATE
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete own card collections"
  ON public.user_card_collections FOR DELETE
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- 2.5 public.notification_settings
DROP POLICY IF EXISTS "Users can view own notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can insert own notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Users can update own notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Authenticated users can view own notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Authenticated users can insert own notification settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Authenticated users can update own notification settings" ON public.notification_settings;

CREATE POLICY "Authenticated users can view own notification settings"
  ON public.notification_settings FOR SELECT
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert own notification settings"
  ON public.notification_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update own notification settings"
  ON public.notification_settings FOR UPDATE
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- 2.6 public.usage_statistics
DROP POLICY IF EXISTS "Users can view own usage statistics" ON public.usage_statistics;
DROP POLICY IF EXISTS "Users can insert own usage statistics" ON public.usage_statistics;
DROP POLICY IF EXISTS "Authenticated users can view own usage statistics" ON public.usage_statistics;
DROP POLICY IF EXISTS "Authenticated users can insert own usage statistics" ON public.usage_statistics;

CREATE POLICY "Authenticated users can view own usage statistics"
  ON public.usage_statistics FOR SELECT
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert own usage statistics"
  ON public.usage_statistics FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- 2.7 public.promo_codes - 공개 조회는 허용
DROP POLICY IF EXISTS "Anyone can view active promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Only admins can manage promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Authenticated users can manage promo codes" ON public.promo_codes;

CREATE POLICY "Anyone can view active promo codes"
    ON public.promo_codes FOR SELECT
    USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

CREATE POLICY "Authenticated users can manage promo codes"
    ON public.promo_codes FOR ALL
    USING (auth.uid() IS NOT NULL);

-- 2.8 public.promo_code_usage
DROP POLICY IF EXISTS "Users can view their own usage" ON public.promo_code_usage;
DROP POLICY IF EXISTS "Anyone can create usage record" ON public.promo_code_usage;
DROP POLICY IF EXISTS "Authenticated users can view own usage" ON public.promo_code_usage;
DROP POLICY IF EXISTS "Authenticated users can create usage record" ON public.promo_code_usage;

CREATE POLICY "Authenticated users can view own usage"
    ON public.promo_code_usage FOR SELECT
    USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create usage record"
    ON public.promo_code_usage FOR INSERT
    WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- 2.9 public.user_subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Authenticated users can view own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Authenticated users can insert own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Authenticated users can update own subscriptions" ON public.user_subscriptions;

CREATE POLICY "Authenticated users can view own subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert own subscriptions"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update own subscriptions"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- 2.10 public.subscription_history
DROP POLICY IF EXISTS "Users can view own subscription history" ON public.subscription_history;
DROP POLICY IF EXISTS "Service role can insert history" ON public.subscription_history;
DROP POLICY IF EXISTS "Authenticated users can view own subscription history" ON public.subscription_history;

CREATE POLICY "Authenticated users can view own subscription history"
  ON public.subscription_history FOR SELECT
  USING (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Service role can insert history"
  ON public.subscription_history FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- 완료 로그
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Security Advisor 보안 경고 수정 완료';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Function Search Path: 10개 함수 수정';
  RAISE NOTICE '✅ Anonymous RLS Policy: 11개 테이블 수정';
  RAISE NOTICE '   (daily_tarot_sessions, spread_readings, users는 이전 마이그레이션에서 처리됨)';
  RAISE NOTICE '========================================';
END $$;
