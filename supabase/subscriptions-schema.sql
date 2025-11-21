-- ============================================================================
-- 타로 타이머 구독 시스템 스키마
-- Apple/Google IAP 영수증 검증 및 구독 관리
-- ============================================================================

-- ============================================================================
-- 1. 구독 정보 테이블 (user_subscriptions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Apple/Google 구독 정보
  product_id TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  original_transaction_id TEXT UNIQUE NOT NULL,

  -- 구독 상태
  is_active BOOLEAN DEFAULT true,
  expiry_date TIMESTAMPTZ NOT NULL,
  purchase_date TIMESTAMPTZ NOT NULL,

  -- 환경 및 플랫폼
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  environment TEXT NOT NULL CHECK (environment IN ('Sandbox', 'Production')),

  -- 영수증 원본 데이터 (보안 - 최소한의 정보만 저장)
  receipt_data JSONB NOT NULL,

  -- 타임스탬프
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_validated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 복합 유니크 제약 (사용자당 하나의 활성 구독)
  CONSTRAINT unique_user_product UNIQUE(user_id, product_id, original_transaction_id)
);

-- ============================================================================
-- 2. 인덱스 생성 (성능 최적화)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id
  ON user_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active
  ON user_subscriptions(is_active, expiry_date)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_transaction
  ON user_subscriptions(transaction_id);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_original_transaction
  ON user_subscriptions(original_transaction_id);

-- ============================================================================
-- 3. 자동 업데이트 트리거
-- ============================================================================
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. Row Level Security (RLS) 정책
-- ============================================================================
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 구독만 조회 가능
CREATE POLICY "Users can view own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Edge Function(service_role)만 삽입 가능
CREATE POLICY "Service role can insert subscriptions"
  ON user_subscriptions FOR INSERT
  WITH CHECK (true);

-- Edge Function(service_role)만 업데이트 가능
CREATE POLICY "Service role can update subscriptions"
  ON user_subscriptions FOR UPDATE
  USING (true);

-- ============================================================================
-- 5. 구독 히스토리 테이블 (환불/변경 추적)
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  event_type TEXT NOT NULL CHECK (
    event_type IN ('created', 'renewed', 'expired', 'cancelled', 'refunded', 'updated')
  ),
  event_data JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 히스토리 인덱스
CREATE INDEX IF NOT EXISTS idx_subscription_history_user
  ON subscription_history(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscription_history_subscription
  ON subscription_history(subscription_id, created_at DESC);

-- 히스토리 RLS
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history"
  ON subscription_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert history"
  ON subscription_history FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 6. Helper Functions
-- ============================================================================

-- 활성 구독 확인 함수
CREATE OR REPLACE FUNCTION get_active_subscription(p_user_id UUID)
RETURNS TABLE (
  subscription_id UUID,
  product_id TEXT,
  expiry_date TIMESTAMPTZ,
  is_active BOOLEAN,
  environment TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    id,
    user_subscriptions.product_id,
    user_subscriptions.expiry_date,
    user_subscriptions.is_active,
    user_subscriptions.environment
  FROM user_subscriptions
  WHERE user_id = p_user_id
    AND is_active = true
    AND expiry_date > NOW()
  ORDER BY expiry_date DESC
  LIMIT 1;
END;
$$;

-- 구독 만료 체크 함수 (크론잡으로 실행 권장)
CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- 만료된 구독 비활성화
  UPDATE user_subscriptions
  SET
    is_active = false,
    updated_at = NOW()
  WHERE expiry_date < NOW()
    AND is_active = true;

  GET DIAGNOSTICS expired_count = ROW_COUNT;

  -- 만료 이벤트 히스토리 기록
  INSERT INTO subscription_history (subscription_id, user_id, event_type, event_data)
  SELECT
    id,
    user_id,
    'expired',
    jsonb_build_object(
      'expiry_date', expiry_date,
      'expired_at', NOW()
    )
  FROM user_subscriptions
  WHERE expiry_date < NOW()
    AND is_active = false
    AND updated_at > NOW() - INTERVAL '1 minute'; -- 방금 업데이트된 것만

  RETURN expired_count;
END;
$$;

-- 사용자 프리미엄 상태 확인 함수 (빠른 조회용)
CREATE OR REPLACE FUNCTION check_premium_status(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_active_subscription BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM user_subscriptions
    WHERE user_id = p_user_id
      AND is_active = true
      AND expiry_date > NOW()
  ) INTO has_active_subscription;

  RETURN has_active_subscription;
END;
$$;

-- ============================================================================
-- 7. 코멘트 (문서화)
-- ============================================================================
COMMENT ON TABLE user_subscriptions IS '사용자 구독 정보 (Apple/Google IAP 영수증 검증)';
COMMENT ON COLUMN user_subscriptions.original_transaction_id IS 'Apple/Google 원본 트랜잭션 ID (고유 식별자)';
COMMENT ON COLUMN user_subscriptions.receipt_data IS '최소한의 영수증 메타데이터 (민감정보 제외)';

COMMENT ON TABLE subscription_history IS '구독 변경 히스토리 (환불/갱신/만료 추적)';

COMMENT ON FUNCTION get_active_subscription IS '사용자의 현재 활성 구독 조회';
COMMENT ON FUNCTION expire_subscriptions IS '만료된 구독 자동 비활성화 (크론잡 실행)';
COMMENT ON FUNCTION check_premium_status IS '사용자 프리미엄 상태 빠른 확인';

-- ============================================================================
-- 8. 초기 데이터 검증 (선택사항)
-- ============================================================================

-- 스키마 생성 확인
DO $$
BEGIN
  RAISE NOTICE '✅ user_subscriptions 테이블 생성 완료';
  RAISE NOTICE '✅ subscription_history 테이블 생성 완료';
  RAISE NOTICE '✅ RLS 정책 4개 활성화 완료';
  RAISE NOTICE '✅ Helper Function 3개 생성 완료';
  RAISE NOTICE '✅ 인덱스 5개 생성 완료';
  RAISE NOTICE '';
  RAISE NOTICE '📌 다음 단계:';
  RAISE NOTICE '1. Supabase Edge Function 배포';
  RAISE NOTICE '2. 클라이언트 코드 수정 (receiptValidator.ts)';
  RAISE NOTICE '3. 환경 변수 설정 (APPLE_SHARED_SECRET)';
END $$;
