/**
 * 날짜 및 시간 관련 유틸리티
 * 구독 만료일 계산 등 정밀한 날짜 처리를 담당합니다.
 */

/**
 * 구독 만료일 계산
 * 월간/연간 구독에 따른 정확한 만료일을 계산합니다.
 * 말일 처리(예: 1월 31일 + 1개월 -> 2월 28/29일)를 포함합니다.
 * 
 * @param startDate 시작일 (Date 객체 또는 ISO 문자열)
 * @param type 구독 타입 ('monthly' | 'yearly')
 * @param duration 기간 (기본값: 1)
 * @returns 만료일 Date 객체
 */
export function calculateSubscriptionExpiry(
    startDate: Date | string,
    type: 'monthly' | 'yearly',
    duration: number = 1
): Date {
    const start = new Date(startDate);
    const expiry = new Date(start);

    if (type === 'monthly') {
        // 월 단위 더하기
        // setMonth는 자동으로 말일 처리를 하지 않고 오버플로우됨 (예: 1/31 + 1달 -> 3/3 or 3/2)
        // 따라서 별도 로직 필요
        const targetMonth = start.getMonth() + duration;
        expiry.setMonth(targetMonth);

        // 오버플로우 체크: 원본 일자와 변경된 일자가 다르면 오버플로우 발생한 것
        // 예: 1월 31일 -> 2월로 설정 -> 3월 3일이 됨 (2월은 28/29일까지이므로)
        // 이 경우 해당 월의 말일로 설정해야 함
        if (expiry.getDate() !== start.getDate()) {
            expiry.setDate(0); // 전달의 말일로 설정 (즉, 목표 월의 말일)
        }
    } else if (type === 'yearly') {
        // 연 단위 더하기
        expiry.setFullYear(start.getFullYear() + duration);

        // 윤년 2월 29일 처리: 2024-02-29 + 1년 -> 2025-02-28
        // setFullYear는 자동으로 처리해주지만 명시적으로 확인
        if (start.getMonth() === 1 && start.getDate() === 29) {
            if (expiry.getMonth() !== 1) { // 2월이 아니면 (3월로 넘어갔으면)
                expiry.setDate(0); // 2월 말일로 설정
            }
        }
    }

    return expiry;
}

/**
 * 날짜 포맷팅 (YYYY-MM-DD)
 */
export function formatDate(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 남은 일수 계산
 */
export function getDaysRemaining(expiryDate: Date | string): number {
    const now = new Date();
    const expiry = new Date(expiryDate);

    // 밀리초 차이 계산
    const diffTime = expiry.getTime() - now.getTime();

    // 일 단위 변환 (올림 처리)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
