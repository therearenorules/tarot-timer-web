-- ============================================
-- 프로모션 코드 관리 테이블
-- ============================================

-- 1. 프로모션 코드 마스터 테이블
CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 코드 정보
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,

    -- 혜택 설정
    free_days INTEGER NOT NULL DEFAULT 7,
    benefits JSONB DEFAULT '{"unlimited_storage": true, "ad_free": true, "premium_spreads": true}'::jsonb,

    -- 사용 제한
    max_uses INTEGER DEFAULT NULL, -- NULL이면 무제한
    current_uses INTEGER DEFAULT 0,

    -- 활성화 여부
    is_active BOOLEAN DEFAULT true,

    -- 유효 기간
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ DEFAULT NULL, -- NULL이면 무제한

    -- 메타데이터
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- 제약 조건
    CONSTRAINT positive_free_days CHECK (free_days > 0),
    CONSTRAINT positive_max_uses CHECK (max_uses IS NULL OR max_uses > 0),
    CONSTRAINT current_uses_lte_max_uses CHECK (max_uses IS NULL OR current_uses <= max_uses)
);

-- 2. 프로모션 코드 사용 내역 테이블
CREATE TABLE IF NOT EXISTS promo_code_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 관계
    promo_code_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id), -- NULL 허용 (익명 사용자)
    device_id VARCHAR(255), -- 디바이스 식별자

    -- 사용 정보
    code VARCHAR(50) NOT NULL,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,

    -- 메타데이터
    user_agent TEXT,
    ip_address INET,
    platform VARCHAR(20), -- 'ios', 'android', 'web'

    -- 제약 조건
    CONSTRAINT unique_user_code UNIQUE (user_id, promo_code_id),
    CONSTRAINT unique_device_code UNIQUE (device_id, promo_code_id)
);

-- ============================================
-- 인덱스 생성 (성능 최적화)
-- ============================================

-- 코드 조회 성능 향상
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active, valid_from, valid_until);

-- 사용 내역 조회 성능 향상
CREATE INDEX IF NOT EXISTS idx_promo_usage_user ON promo_code_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_usage_device ON promo_code_usage(device_id);
CREATE INDEX IF NOT EXISTS idx_promo_usage_code ON promo_code_usage(code);
CREATE INDEX IF NOT EXISTS idx_promo_usage_expires ON promo_code_usage(expires_at);

-- ============================================
-- 트리거 함수 (자동 업데이트)
-- ============================================

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거
DROP TRIGGER IF EXISTS update_promo_codes_updated_at ON promo_codes;
CREATE TRIGGER update_promo_codes_updated_at
    BEFORE UPDATE ON promo_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 프로모션 코드 사용 시 current_uses 증가 트리거
-- ============================================

CREATE OR REPLACE FUNCTION increment_promo_code_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE promo_codes
    SET current_uses = current_uses + 1
    WHERE id = NEW.promo_code_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS increment_usage_on_apply ON promo_code_usage;
CREATE TRIGGER increment_usage_on_apply
    AFTER INSERT ON promo_code_usage
    FOR EACH ROW
    EXECUTE FUNCTION increment_promo_code_usage();

-- ============================================
-- RLS (Row Level Security) 정책
-- ============================================

-- RLS 활성화
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;

-- 1. 프로모션 코드 조회: 모든 사용자 (활성화된 코드만)
DROP POLICY IF EXISTS "Anyone can view active promo codes" ON promo_codes;
CREATE POLICY "Anyone can view active promo codes"
    ON promo_codes FOR SELECT
    USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

-- 2. 프로모션 코드 생성/수정/삭제: 관리자만
-- (나중에 관리자 역할 추가 시 수정)
DROP POLICY IF EXISTS "Only admins can manage promo codes" ON promo_codes;
CREATE POLICY "Only admins can manage promo codes"
    ON promo_codes FOR ALL
    USING (auth.uid() IS NOT NULL); -- 임시: 인증된 사용자만

-- 3. 사용 내역 조회: 본인 것만
DROP POLICY IF EXISTS "Users can view their own usage" ON promo_code_usage;
CREATE POLICY "Users can view their own usage"
    ON promo_code_usage FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- 4. 사용 내역 생성: 모든 사용자
DROP POLICY IF EXISTS "Anyone can create usage record" ON promo_code_usage;
CREATE POLICY "Anyone can create usage record"
    ON promo_code_usage FOR INSERT
    WITH CHECK (true);

-- ============================================
-- 초기 데이터 삽입 (기존 코드 마이그레이션)
-- ============================================

INSERT INTO promo_codes (code, description, free_days, is_active, created_at) VALUES
    ('TAROT2025', '2025년 신규 가입 웰컴 코드', 7, true, NOW()),
    ('타로사랑', '타로 애호가 특별 코드', 7, true, NOW()),
    ('웰컴7일', '신규 사용자 환영 7일 무료', 7, true, NOW()),
    ('데아노사주타로', '데아노사주타로 협업 코드', 7, true, NOW())
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 유틸리티 함수
-- ============================================

-- 1. 프로모션 코드 유효성 검증 함수
CREATE OR REPLACE FUNCTION validate_promo_code(
    p_code VARCHAR(50),
    p_device_id VARCHAR(255) DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS TABLE(
    is_valid BOOLEAN,
    error_message TEXT,
    promo_id UUID,
    free_days INTEGER,
    benefits JSONB
) AS $$
DECLARE
    v_promo promo_codes%ROWTYPE;
    v_already_used BOOLEAN;
BEGIN
    -- 1. 코드 존재 및 활성화 여부 확인 (대소문자 무관)
    SELECT * INTO v_promo
    FROM promo_codes
    WHERE UPPER(code) = UPPER(p_code)
      AND is_active = true
      AND (valid_from IS NULL OR valid_from <= NOW())
      AND (valid_until IS NULL OR valid_until > NOW());

    IF NOT FOUND THEN
        RETURN QUERY SELECT false, '유효하지 않거나 만료된 코드입니다.', NULL::UUID, NULL::INTEGER, NULL::JSONB;
        RETURN;
    END IF;

    -- 2. 사용 횟수 제한 확인
    IF v_promo.max_uses IS NOT NULL AND v_promo.current_uses >= v_promo.max_uses THEN
        RETURN QUERY SELECT false, '사용 가능한 횟수를 초과했습니다.', NULL::UUID, NULL::INTEGER, NULL::JSONB;
        RETURN;
    END IF;

    -- 3. 중복 사용 확인 (user_id 또는 device_id)
    SELECT EXISTS(
        SELECT 1 FROM promo_code_usage
        WHERE promo_code_id = v_promo.id
          AND (
              (p_user_id IS NOT NULL AND user_id = p_user_id)
              OR (p_device_id IS NOT NULL AND device_id = p_device_id)
          )
    ) INTO v_already_used;

    IF v_already_used THEN
        RETURN QUERY SELECT false, '이미 사용한 코드입니다.', NULL::UUID, NULL::INTEGER, NULL::JSONB;
        RETURN;
    END IF;

    -- 4. 유효한 코드
    RETURN QUERY SELECT true, NULL::TEXT, v_promo.id, v_promo.free_days, v_promo.benefits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 프로모션 코드 적용 함수
CREATE OR REPLACE FUNCTION apply_promo_code(
    p_code VARCHAR(50),
    p_device_id VARCHAR(255),
    p_user_id UUID DEFAULT NULL,
    p_platform VARCHAR(20) DEFAULT 'web',
    p_user_agent TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    expires_at TIMESTAMPTZ,
    benefits JSONB
) AS $$
DECLARE
    v_validation RECORD;
BEGIN
    -- 1. 코드 유효성 검증
    SELECT * INTO v_validation
    FROM validate_promo_code(p_code, p_device_id, p_user_id);

    IF NOT v_validation.is_valid THEN
        RETURN QUERY SELECT false, v_validation.error_message, NULL::TIMESTAMPTZ, NULL::JSONB;
        RETURN;
    END IF;

    -- 2. 사용 내역 생성
    INSERT INTO promo_code_usage (
        promo_code_id,
        user_id,
        device_id,
        code,
        expires_at,
        platform,
        user_agent,
        ip_address
    ) VALUES (
        v_validation.promo_id,
        p_user_id,
        p_device_id,
        p_code,
        NOW() + (v_validation.free_days || ' days')::INTERVAL,
        p_platform,
        p_user_agent,
        p_ip_address
    );

    -- 3. 성공 응답
    RETURN QUERY SELECT
        true,
        '🎉 ' || v_validation.free_days || '일간 프리미엄 혜택이 적용되었습니다!',
        (NOW() + (v_validation.free_days || ' days')::INTERVAL)::TIMESTAMPTZ,
        v_validation.benefits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 관리자용 통계 뷰 (SECURITY DEFINER)
-- ============================================

CREATE OR REPLACE VIEW promo_code_stats
WITH (security_barrier = true)
AS
SELECT
    pc.id,
    pc.code,
    pc.description,
    pc.free_days,
    pc.max_uses,
    pc.current_uses,
    pc.is_active,
    pc.valid_from,
    pc.valid_until,
    COUNT(DISTINCT pcu.id) AS total_redemptions,
    COUNT(DISTINCT pcu.user_id) AS unique_users,
    COUNT(DISTINCT pcu.device_id) AS unique_devices,
    MAX(pcu.applied_at) AS last_used_at,
    pc.created_at
FROM promo_codes pc
LEFT JOIN promo_code_usage pcu ON pc.id = pcu.promo_code_id
GROUP BY pc.id, pc.code, pc.description, pc.free_days, pc.max_uses,
         pc.current_uses, pc.is_active, pc.valid_from, pc.valid_until, pc.created_at;

COMMENT ON VIEW promo_code_stats IS '프로모션 코드 통계 (관리자 전용 - SECURITY BARRIER 적용)';

-- 관리자만 접근 가능하도록 권한 설정
REVOKE ALL ON promo_code_stats FROM PUBLIC;
REVOKE ALL ON promo_code_stats FROM anon;
REVOKE ALL ON promo_code_stats FROM authenticated;

-- service_role(관리자)만 SELECT 권한 부여
GRANT SELECT ON promo_code_stats TO service_role;
