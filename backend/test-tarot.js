// Simple test script to verify TarotCardService functionality
const TarotCardService = require('./dist/services/TarotCardService.js').default;

console.log('🔮 Testing TarotCardService...\n');

// Test 1: Service Status
console.log('1. Testing Service Status:');
try {
  const status = TarotCardService.getServiceStatus();
  console.log('✅ Service Status:', JSON.stringify(status, null, 2));
} catch (error) {
  console.log('❌ Service Status Error:', error.message);
}

// Test 2: Generate Daily Cards
console.log('\n2. Testing Daily Cards Generation:');
try {
  const userId = 'test_user_123';
  const cards = TarotCardService.generateDailyCards(userId);
  console.log(`✅ Generated ${cards.length} daily cards for user ${userId}`);
  console.log('Sample cards:');
  cards.slice(0, 3).forEach((card, index) => {
    console.log(`  ${index}:00 - ${card.nameKr} (${card.name}): ${card.meaningKr}`);
  });
} catch (error) {
  console.log('❌ Daily Cards Error:', error.message);
}

// Test 3: Get Hourly Card
console.log('\n3. Testing Hourly Card Retrieval:');
try {
  const userId = 'test_user_123';
  const hour = new Date().getHours();
  const card = TarotCardService.getHourlyCard(userId, hour);
  if (card) {
    console.log(`✅ Card for hour ${hour}: ${TarotCardService.getCardSummary(card)}`);
  } else {
    console.log('❌ No card found');
  }
} catch (error) {
  console.log('❌ Hourly Card Error:', error.message);
}

// Test 4: Midnight Reset
console.log('\n4. Testing Midnight Reset:');
TarotCardService.performMidnightReset('test_user_123', 'Asia/Seoul')
  .then(result => {
    console.log('✅ Midnight Reset Result:', JSON.stringify(result, null, 2));
    if (result.success && result.newCards) {
      console.log(`Generated ${result.newCards.length} new cards for ${result.date}`);
    }
  })
  .catch(error => {
    console.log('❌ Midnight Reset Error:', error.message);
  });

// Test 5: Format Hour
console.log('\n5. Testing Hour Formatting:');
for (let hour of [0, 6, 12, 18, 23]) {
  console.log(`${hour}:00 → ${TarotCardService.formatHour(hour)}`);
}

console.log('\n🔮 Test completed!\n');