import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 로컬 Prisma 데이터베이스의 데이터 상태 확인
 */
async function checkLocalData() {
  console.log('🔍 로컬 데이터베이스 상태 확인 중...');

  try {
    // 각 테이블별 데이터 개수 확인
    const [
      userCount,
      dailySessionCount,
      spreadReadingCount,
      userAnalyticsCount,
      cardThemeCount,
      themeOwnershipCount,
      subscriptionCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.dailyTarotSession.count(),
      prisma.spreadReading.count(),
      prisma.userAnalytic.count(),
      prisma.cardTheme.count(),
      prisma.userThemeOwnership.count(),
      prisma.subscription.count()
    ]);

    console.log('\n📊 로컬 데이터베이스 현황:');
    console.log('═══════════════════════════════════');
    console.log(`👥 Users: ${userCount}개`);
    console.log(`📅 Daily Tarot Sessions: ${dailySessionCount}개`);
    console.log(`🃏 Spread Readings: ${spreadReadingCount}개`);
    console.log(`📈 User Analytics: ${userAnalyticsCount}개`);
    console.log(`🎨 Card Themes: ${cardThemeCount}개`);
    console.log(`🏷️ Theme Ownership: ${themeOwnershipCount}개`);
    console.log(`💎 Subscriptions: ${subscriptionCount}개`);
    console.log('═══════════════════════════════════');

    const totalRecords = userCount + dailySessionCount + spreadReadingCount +
                        userAnalyticsCount + cardThemeCount + themeOwnershipCount + subscriptionCount;

    console.log(`📋 총 데이터: ${totalRecords}개`);

    // 샘플 데이터 조회 (사용자)
    if (userCount > 0) {
      console.log('\n👤 사용자 샘플 데이터:');
      const sampleUsers = await prisma.user.findMany({
        take: 3,
        select: {
          id: true,
          email: true,
          createdAt: true,
          totalSessions: true
        }
      });

      sampleUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} - ${user.totalSessions}세션`);
      });
    }

    // 샘플 데이터 조회 (일일 세션)
    if (dailySessionCount > 0) {
      console.log('\n📅 일일 세션 샘플 데이터:');
      const sampleSessions = await prisma.dailyTarotSession.findMany({
        take: 3,
        select: {
          id: true,
          date: true,
          cards: true,
          user: {
            select: { email: true }
          }
        }
      });

      sampleSessions.forEach((session, index) => {
        console.log(`  ${index + 1}. ${session.date.toISOString().split('T')[0]} - 카드 데이터 있음 (${session.user.email})`);
      });
    }

    // 샘플 데이터 조회 (스프레드 리딩)
    if (spreadReadingCount > 0) {
      console.log('\n🃏 스프레드 리딩 샘플 데이터:');
      const sampleReadings = await prisma.spreadReading.findMany({
        take: 3,
        select: {
          id: true,
          spreadType: true,
          title: true,
          createdAt: true,
          user: {
            select: { email: true }
          }
        }
      });

      sampleReadings.forEach((reading, index) => {
        console.log(`  ${index + 1}. ${reading.spreadType} - "${reading.title || '제목 없음'}" (${reading.user.email})`);
      });
    }

    // 마이그레이션 가능 여부 판단
    if (totalRecords > 0) {
      console.log('\n✅ 마이그레이션 가능한 데이터가 존재합니다.');
      console.log('💡 마이그레이션을 실행하려면 다음 명령어를 실행하세요:');
      console.log('   npx ts-node src/utils/migrateToSupabase.ts');
    } else {
      console.log('\n⚠️ 마이그레이션할 데이터가 없습니다.');
      console.log('💡 테스트 데이터를 생성하려면 다음 명령어를 실행하세요:');
      console.log('   npx ts-node src/utils/seedTestData.ts');
    }

  } catch (error) {
    console.error('❌ 로컬 데이터 확인 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 직접 실행시
if (require.main === module) {
  checkLocalData();
}

export default checkLocalData;