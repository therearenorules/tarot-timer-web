import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// 환경변수 로드
dotenv.config();

/**
 * 로컬 Prisma 데이터베이스에서 Supabase로 데이터 마이그레이션
 *
 * 마이그레이션 순서:
 * 1. Users
 * 2. Daily Tarot Sessions
 * 3. Spread Readings
 * 4. User Analytics
 * 5. Card Themes
 * 6. User Theme Ownership
 * 7. Subscriptions
 */

const prisma = new PrismaClient();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * CUID를 UUID로 변환하는 함수
 * CUID는 Supabase UUID와 호환되지 않으므로 매핑을 통해 변환
 */
const cuidToUuidMap = new Map<string, string>();

function convertCuidToUuid(cuid: string): string {
  if (!cuidToUuidMap.has(cuid)) {
    // 기존 CUID가 이미 UUID 형식인지 확인
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(cuid)) {
      cuidToUuidMap.set(cuid, cuid);
    } else {
      // 새로운 UUID 생성하고 매핑 저장
      cuidToUuidMap.set(cuid, uuidv4());
    }
  }
  return cuidToUuidMap.get(cuid)!;
}

/**
 * JSON 데이터 파싱 안전 함수
 */
function safeJsonParse(data: any): any {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.warn('JSON 파싱 실패, 원본 문자열 반환:', data);
      return data;
    }
  }
  return data;
}

interface MigrationStats {
  users: { local: number; migrated: number; errors: number };
  dailySessions: { local: number; migrated: number; errors: number };
  spreadReadings: { local: number; migrated: number; errors: number };
  userAnalytics: { local: number; migrated: number; errors: number };
  cardThemes: { local: number; migrated: number; errors: number };
  themeOwnership: { local: number; migrated: number; errors: number };
  subscriptions: { local: number; migrated: number; errors: number };
}

const stats: MigrationStats = {
  users: { local: 0, migrated: 0, errors: 0 },
  dailySessions: { local: 0, migrated: 0, errors: 0 },
  spreadReadings: { local: 0, migrated: 0, errors: 0 },
  userAnalytics: { local: 0, migrated: 0, errors: 0 },
  cardThemes: { local: 0, migrated: 0, errors: 0 },
  themeOwnership: { local: 0, migrated: 0, errors: 0 },
  subscriptions: { local: 0, migrated: 0, errors: 0 }
};

async function migrateUsers() {
  console.log('\n👥 1. Users 마이그레이션 시작...');

  try {
    const localUsers = await prisma.user.findMany();
    stats.users.local = localUsers.length;

    console.log(`📊 로컬에서 ${localUsers.length}명의 사용자 발견`);

    for (const user of localUsers) {
      try {
        // Supabase에 사용자 삽입 (CUID를 UUID로 변환)
        const userUuid = convertCuidToUuid(user.id);
        const { data, error } = await supabase
          .from('users')
          .upsert({
            id: userUuid,
            email: user.email,
            language: user.language,
            timezone: user.timezone,
            subscription_status: user.subscriptionStatus,
            trial_start_date: user.trialStartDate?.toISOString(),
            trial_end_date: user.trialEndDate?.toISOString(),
            total_sessions: user.totalSessions,
            last_active: user.lastActive?.toISOString(),
            stripe_customer_id: user.stripeCustomerId,
            stripe_subscription_id: user.stripeSubscriptionId,
            active_card_theme_id: user.activeCardThemeId ? convertCuidToUuid(user.activeCardThemeId) : null,
            created_at: user.createdAt.toISOString(),
            updated_at: user.updatedAt.toISOString()
          })
          .select();

        if (error) {
          console.error(`❌ 사용자 ${user.email} 마이그레이션 실패:`, error.message);
          stats.users.errors++;
        } else {
          console.log(`✅ 사용자 ${user.email} 마이그레이션 성공`);
          stats.users.migrated++;
        }
      } catch (error) {
        console.error(`❌ 사용자 ${user.email} 마이그레이션 오류:`, error);
        stats.users.errors++;
      }
    }
  } catch (error) {
    console.error('❌ Users 마이그레이션 실패:', error);
  }
}

async function migrateDailySessions() {
  console.log('\n📅 2. Daily Tarot Sessions 마이그레이션 시작...');

  try {
    const localSessions = await prisma.dailyTarotSession.findMany();
    stats.dailySessions.local = localSessions.length;

    console.log(`📊 로컬에서 ${localSessions.length}개의 일일 세션 발견`);

    for (const session of localSessions) {
      try {
        const { data, error } = await supabase
          .from('daily_tarot_sessions')
          .upsert({
            id: convertCuidToUuid(session.id),
            user_id: convertCuidToUuid(session.userId),
            date: session.date.toISOString().split('T')[0], // Date only
            cards: safeJsonParse(session.cards),
            memos: safeJsonParse(session.memos),
            insights: safeJsonParse(session.insights),
            created_at: session.createdAt.toISOString(),
            updated_at: session.updatedAt.toISOString()
          })
          .select();

        if (error) {
          console.error(`❌ 세션 ${session.id} 마이그레이션 실패:`, error.message);
          stats.dailySessions.errors++;
        } else {
          console.log(`✅ 세션 ${session.id} 마이그레이션 성공`);
          stats.dailySessions.migrated++;
        }
      } catch (error) {
        console.error(`❌ 세션 ${session.id} 마이그레이션 오류:`, error);
        stats.dailySessions.errors++;
      }
    }
  } catch (error) {
    console.error('❌ Daily Sessions 마이그레이션 실패:', error);
  }
}

async function migrateSpreadReadings() {
  console.log('\n🃏 3. Spread Readings 마이그레이션 시작...');

  try {
    const localReadings = await prisma.spreadReading.findMany();
    stats.spreadReadings.local = localReadings.length;

    console.log(`📊 로컬에서 ${localReadings.length}개의 스프레드 리딩 발견`);

    for (const reading of localReadings) {
      try {
        const { data, error } = await supabase
          .from('spread_readings')
          .upsert({
            id: convertCuidToUuid(reading.id),
            user_id: convertCuidToUuid(reading.userId),
            title: reading.title,
            spread_type: reading.spreadType,
            spread_name: reading.spreadName,
            spread_name_en: reading.spreadNameEn,
            positions: safeJsonParse(reading.positions),
            insights: safeJsonParse(reading.insights),
            tags: safeJsonParse(reading.tags),
            created_at: reading.createdAt.toISOString(),
            updated_at: reading.updatedAt.toISOString()
          })
          .select();

        if (error) {
          console.error(`❌ 리딩 ${reading.id} 마이그레이션 실패:`, error.message);
          stats.spreadReadings.errors++;
        } else {
          console.log(`✅ 리딩 ${reading.id} 마이그레이션 성공`);
          stats.spreadReadings.migrated++;
        }
      } catch (error) {
        console.error(`❌ 리딩 ${reading.id} 마이그레이션 오류:`, error);
        stats.spreadReadings.errors++;
      }
    }
  } catch (error) {
    console.error('❌ Spread Readings 마이그레이션 실패:', error);
  }
}

async function migrateUserAnalytics() {
  console.log('\n📈 4. User Analytics 마이그레이션 시작...');

  try {
    const localAnalytics = await prisma.userAnalytic.findMany();
    stats.userAnalytics.local = localAnalytics.length;

    console.log(`📊 로컬에서 ${localAnalytics.length}개의 분석 데이터 발견`);

    for (const analytics of localAnalytics) {
      try {
        const { data, error } = await supabase
          .from('user_analytics')
          .upsert({
            id: convertCuidToUuid(analytics.id),
            user_hash: analytics.userHash,
            user_id: analytics.userId ? convertCuidToUuid(analytics.userId) : null,
            event_type: analytics.eventType,
            event_data: analytics.eventData,
            session_id: analytics.sessionId,
            user_agent: analytics.userAgent,
            language: analytics.language,
            timezone: analytics.timezone,
            created_at: analytics.createdAt.toISOString()
          })
          .select();

        if (error) {
          console.error(`❌ 분석 ${analytics.id} 마이그레이션 실패:`, error.message);
          stats.userAnalytics.errors++;
        } else {
          console.log(`✅ 분석 ${analytics.id} 마이그레이션 성공`);
          stats.userAnalytics.migrated++;
        }
      } catch (error) {
        console.error(`❌ 분석 ${analytics.id} 마이그레이션 오류:`, error);
        stats.userAnalytics.errors++;
      }
    }
  } catch (error) {
    console.error('❌ User Analytics 마이그레이션 실패:', error);
  }
}

async function migrateCardThemes() {
  console.log('\n🎨 5. Card Themes 마이그레이션 시작...');

  try {
    const localThemes = await prisma.cardTheme.findMany();
    stats.cardThemes.local = localThemes.length;

    console.log(`📊 로컬에서 ${localThemes.length}개의 카드 테마 발견`);

    for (const theme of localThemes) {
      try {
        const { data, error } = await supabase
          .from('card_themes')
          .upsert({
            id: convertCuidToUuid(theme.id),
            name: theme.name,
            name_kr: theme.nameKr,
            name_en: theme.nameEn,
            name_ja: theme.nameJa,
            description: theme.description,
            description_kr: theme.descriptionKr,
            description_en: theme.descriptionEn,
            description_ja: theme.descriptionJa,
            price: theme.price,
            is_active: theme.isActive,
            is_default: theme.isDefault,
            style: theme.style,
            card_assets: theme.cardAssets,
            thumbnail_url: theme.thumbnailUrl,
            created_at: theme.createdAt.toISOString(),
            updated_at: theme.updatedAt.toISOString()
          })
          .select();

        if (error) {
          console.error(`❌ 테마 ${theme.name} 마이그레이션 실패:`, error.message);
          stats.cardThemes.errors++;
        } else {
          console.log(`✅ 테마 ${theme.name} 마이그레이션 성공`);
          stats.cardThemes.migrated++;
        }
      } catch (error) {
        console.error(`❌ 테마 ${theme.name} 마이그레이션 오류:`, error);
        stats.cardThemes.errors++;
      }
    }
  } catch (error) {
    console.error('❌ Card Themes 마이그레이션 실패:', error);
  }
}

async function migrateThemeOwnership() {
  console.log('\n🏷️ 6. User Theme Ownership 마이그레이션 시작...');

  try {
    const localOwnership = await prisma.userThemeOwnership.findMany();
    stats.themeOwnership.local = localOwnership.length;

    console.log(`📊 로컬에서 ${localOwnership.length}개의 테마 소유권 발견`);

    for (const ownership of localOwnership) {
      try {
        const { data, error } = await supabase
          .from('user_theme_ownership')
          .upsert({
            id: convertCuidToUuid(ownership.id),
            user_id: convertCuidToUuid(ownership.userId),
            card_theme_id: convertCuidToUuid(ownership.cardThemeId),
            purchased_at: ownership.purchasedAt.toISOString(),
            purchase_price: ownership.purchasePrice,
            stripe_payment_intent_id: ownership.stripePaymentIntentId
          })
          .select();

        if (error) {
          console.error(`❌ 소유권 ${ownership.id} 마이그레이션 실패:`, error.message);
          stats.themeOwnership.errors++;
        } else {
          console.log(`✅ 소유권 ${ownership.id} 마이그레이션 성공`);
          stats.themeOwnership.migrated++;
        }
      } catch (error) {
        console.error(`❌ 소유권 ${ownership.id} 마이그레이션 오류:`, error);
        stats.themeOwnership.errors++;
      }
    }
  } catch (error) {
    console.error('❌ Theme Ownership 마이그레이션 실패:', error);
  }
}

async function migrateSubscriptions() {
  console.log('\n💎 7. Subscriptions 마이그레이션 시작...');

  try {
    const localSubscriptions = await prisma.subscription.findMany();
    stats.subscriptions.local = localSubscriptions.length;

    console.log(`📊 로컬에서 ${localSubscriptions.length}개의 구독 발견`);

    for (const subscription of localSubscriptions) {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .upsert({
            id: convertCuidToUuid(subscription.id),
            user_id: convertCuidToUuid(subscription.userId),
            stripe_subscription_id: subscription.stripeSubscriptionId,
            stripe_price_id: subscription.stripePriceId,
            stripe_customer_id: subscription.stripeCustomerId,
            status: subscription.status,
            current_period_start: subscription.currentPeriodStart.toISOString(),
            current_period_end: subscription.currentPeriodEnd.toISOString(),
            plan: subscription.plan,
            amount: subscription.amount,
            currency: subscription.currency,
            created_at: subscription.createdAt.toISOString(),
            updated_at: subscription.updatedAt.toISOString(),
            canceled_at: subscription.canceledAt?.toISOString()
          })
          .select();

        if (error) {
          console.error(`❌ 구독 ${subscription.id} 마이그레이션 실패:`, error.message);
          stats.subscriptions.errors++;
        } else {
          console.log(`✅ 구독 ${subscription.id} 마이그레이션 성공`);
          stats.subscriptions.migrated++;
        }
      } catch (error) {
        console.error(`❌ 구독 ${subscription.id} 마이그레이션 오류:`, error);
        stats.subscriptions.errors++;
      }
    }
  } catch (error) {
    console.error('❌ Subscriptions 마이그레이션 실패:', error);
  }
}

function printMigrationReport() {
  console.log('\n📋 ═══════════════════════════════════════');
  console.log('           🎯 마이그레이션 완료 보고서');
  console.log('═══════════════════════════════════════');

  const tableData = [
    ['테이블', '로컬 데이터', '마이그레이션 성공', '오류', '성공률'],
    ['─'.repeat(20), '─'.repeat(10), '─'.repeat(15), '─'.repeat(5), '─'.repeat(8)],
    ['Users', stats.users.local.toString(), stats.users.migrated.toString(), stats.users.errors.toString(),
     stats.users.local > 0 ? `${((stats.users.migrated / stats.users.local) * 100).toFixed(1)}%` : '0%'],
    ['Daily Sessions', stats.dailySessions.local.toString(), stats.dailySessions.migrated.toString(), stats.dailySessions.errors.toString(),
     stats.dailySessions.local > 0 ? `${((stats.dailySessions.migrated / stats.dailySessions.local) * 100).toFixed(1)}%` : '0%'],
    ['Spread Readings', stats.spreadReadings.local.toString(), stats.spreadReadings.migrated.toString(), stats.spreadReadings.errors.toString(),
     stats.spreadReadings.local > 0 ? `${((stats.spreadReadings.migrated / stats.spreadReadings.local) * 100).toFixed(1)}%` : '0%'],
    ['User Analytics', stats.userAnalytics.local.toString(), stats.userAnalytics.migrated.toString(), stats.userAnalytics.errors.toString(),
     stats.userAnalytics.local > 0 ? `${((stats.userAnalytics.migrated / stats.userAnalytics.local) * 100).toFixed(1)}%` : '0%'],
    ['Card Themes', stats.cardThemes.local.toString(), stats.cardThemes.migrated.toString(), stats.cardThemes.errors.toString(),
     stats.cardThemes.local > 0 ? `${((stats.cardThemes.migrated / stats.cardThemes.local) * 100).toFixed(1)}%` : '0%'],
    ['Theme Ownership', stats.themeOwnership.local.toString(), stats.themeOwnership.migrated.toString(), stats.themeOwnership.errors.toString(),
     stats.themeOwnership.local > 0 ? `${((stats.themeOwnership.migrated / stats.themeOwnership.local) * 100).toFixed(1)}%` : '0%'],
    ['Subscriptions', stats.subscriptions.local.toString(), stats.subscriptions.migrated.toString(), stats.subscriptions.errors.toString(),
     stats.subscriptions.local > 0 ? `${((stats.subscriptions.migrated / stats.subscriptions.local) * 100).toFixed(1)}%` : '0%']
  ];

  tableData.forEach(row => {
    console.log(`│ ${row[0].padEnd(19)} │ ${row[1].padEnd(9)} │ ${row[2].padEnd(14)} │ ${row[3].padEnd(4)} │ ${row[4].padEnd(7)} │`);
  });

  const totalLocal = Object.values(stats).reduce((sum, stat) => sum + stat.local, 0);
  const totalMigrated = Object.values(stats).reduce((sum, stat) => sum + stat.migrated, 0);
  const totalErrors = Object.values(stats).reduce((sum, stat) => sum + stat.errors, 0);

  console.log('═══════════════════════════════════════');
  console.log(`📊 총 요약:`);
  console.log(`   • 로컬 데이터: ${totalLocal}개`);
  console.log(`   • 마이그레이션 성공: ${totalMigrated}개`);
  console.log(`   • 오류: ${totalErrors}개`);
  console.log(`   • 전체 성공률: ${totalLocal > 0 ? ((totalMigrated / totalLocal) * 100).toFixed(1) : 0}%`);
  console.log('═══════════════════════════════════════');

  if (totalErrors === 0) {
    console.log('🎉 모든 데이터가 성공적으로 마이그레이션되었습니다!');
  } else {
    console.log(`⚠️ ${totalErrors}개의 오류가 발생했습니다. 로그를 확인해주세요.`);
  }
}

async function validateMigration() {
  console.log('\n🔍 마이그레이션 검증 중...');

  try {
    // Supabase에서 각 테이블 개수 확인
    const [
      { count: supabaseUsers },
      { count: supabaseSessions },
      { count: supabaseReadings }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('daily_tarot_sessions').select('*', { count: 'exact', head: true }),
      supabase.from('spread_readings').select('*', { count: 'exact', head: true })
    ]);

    console.log('📊 Supabase 데이터 검증:');
    console.log(`   • Users: ${supabaseUsers}개`);
    console.log(`   • Daily Sessions: ${supabaseSessions}개`);
    console.log(`   • Spread Readings: ${supabaseReadings}개`);

    // 비교 검증
    const isValid =
      supabaseUsers === stats.users.migrated &&
      supabaseSessions === stats.dailySessions.migrated &&
      supabaseReadings === stats.spreadReadings.migrated;

    if (isValid) {
      console.log('✅ 마이그레이션 검증 성공!');
    } else {
      console.log('⚠️ 마이그레이션 검증 실패 - 데이터 개수 불일치');
    }

  } catch (error) {
    console.error('❌ 마이그레이션 검증 오류:', error);
  }
}

async function migrateToSupabase() {
  console.log('🚀 ═══════════════════════════════════════');
  console.log('    Prisma → Supabase 데이터 마이그레이션');
  console.log('═══════════════════════════════════════');

  const startTime = Date.now();

  try {
    // 단계별 마이그레이션 실행
    await migrateUsers();
    await migrateDailySessions();
    await migrateSpreadReadings();
    await migrateUserAnalytics();
    await migrateCardThemes();
    await migrateThemeOwnership();
    await migrateSubscriptions();

    // 마이그레이션 검증
    await validateMigration();

    // 결과 보고서 출력
    printMigrationReport();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`\n⏱️ 마이그레이션 완료 시간: ${duration}초`);

  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 직접 실행시
if (require.main === module) {
  migrateToSupabase();
}

export default migrateToSupabase;