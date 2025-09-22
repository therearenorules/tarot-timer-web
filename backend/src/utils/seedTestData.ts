import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestData() {
  console.log('🌱 테스트 데이터 생성 시작...');

  try {
    // 기존 데이터 정리 (필요시)
    // await prisma.user.deleteMany();

    // 테스트 사용자 5명 생성 (다양한 날짜)
    const testUsers = await Promise.all([
      prisma.user.create({
        data: {
          email: 'user1@example.com',
          language: 'ko',
          timezone: 'Asia/Seoul',
          totalSessions: 15,
          trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6일 전
          lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1일 전
        }
      }),
      prisma.user.create({
        data: {
          email: 'user2@example.com',
          language: 'ko',
          timezone: 'Asia/Seoul',
          totalSessions: 8,
          trialEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2일 후
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5일 전
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전
        }
      }),
      prisma.user.create({
        data: {
          email: 'user3@example.com',
          language: 'en',
          timezone: 'America/New_York',
          totalSessions: 23,
          trialEndDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4일 후
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3일 전
          lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30분 전
        }
      }),
      prisma.user.create({
        data: {
          email: 'user4@example.com',
          language: 'ko',
          timezone: 'Asia/Seoul',
          totalSessions: 12,
          trialEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5일 후
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2일 전
          lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1시간 전
        }
      }),
      prisma.user.create({
        data: {
          email: 'user5@example.com',
          language: 'ko',
          timezone: 'Asia/Seoul',
          totalSessions: 7,
          trialEndDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6일 후
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1일 전
          lastActive: new Date(Date.now() - 10 * 60 * 1000), // 10분 전
        }
      })
    ]);

    console.log(`✅ ${testUsers.length}명의 테스트 사용자 생성 완료`);

    // 각 사용자에 대해 일일 세션 생성
    for (const user of testUsers) {
      // 최근 3일간의 세션 생성
      for (let i = 0; i < 3; i++) {
        const sessionDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000);

        await prisma.dailyTarotSession.create({
          data: {
            userId: user.id,
            date: sessionDate,
            cards: JSON.stringify(Array.from({ length: 24 }, (_, hour) => ({
              hour,
              cardId: Math.floor(Math.random() * 78) + 1,
              cardName: `카드 ${hour + 1}`,
              interpretation: `${hour}시 해석`
            }))),
            memos: JSON.stringify({
              [Math.floor(Math.random() * 24)]: '오늘 하루 좋은 일이 있을 것 같아요',
              [Math.floor(Math.random() * 24)]: '조심해야 할 시간대네요'
            }),
            insights: '오늘은 전반적으로 긍정적인 에너지가 흐르는 날입니다.'
          }
        });
      }
    }

    console.log('✅ 일일 세션 데이터 생성 완료');

    // 몇 개의 스프레드 리딩 생성
    for (const user of testUsers.slice(0, 3)) {
      await prisma.spreadReading.create({
        data: {
          userId: user.id,
          title: '오늘의 사랑운',
          spreadType: 'love',
          spreadName: '연애 3장 스프레드',
          spreadNameEn: 'Love 3-Card Spread',
          positions: JSON.stringify([
            {
              position: 'past',
              card: { id: 1, name: '마법사', nameEn: 'The Magician' },
              interpretation: '과거의 경험이 현재에 도움이 됩니다'
            },
            {
              position: 'present',
              card: { id: 2, name: '여사제', nameEn: 'The High Priestess' },
              interpretation: '직감을 믿어야 할 때입니다'
            },
            {
              position: 'future',
              card: { id: 3, name: '여황제', nameEn: 'The Empress' },
              interpretation: '풍요로운 미래가 기다리고 있습니다'
            }
          ]),
          insights: '전반적으로 긍정적인 흐름이 보입니다.',
          tags: JSON.stringify(['사랑', '연애', '감정'])
        }
      });
    }

    console.log('✅ 스프레드 리딩 데이터 생성 완료');

    // 통계 확인
    const userCount = await prisma.user.count();
    const sessionCount = await prisma.dailyTarotSession.count();
    const spreadCount = await prisma.spreadReading.count();

    console.log('📊 생성된 데이터 통계:');
    console.log(`   - 사용자: ${userCount}명`);
    console.log(`   - 일일 세션: ${sessionCount}개`);
    console.log(`   - 스프레드 리딩: ${spreadCount}개`);

    console.log('🎉 테스트 데이터 생성 완료!');

  } catch (error) {
    console.error('❌ 테스트 데이터 생성 중 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 직접 실행시
if (require.main === module) {
  seedTestData();
}

export default seedTestData;