#!/usr/bin/env node

// Test tolerance edge cases

const parseBlockId = (blockId) => {
  if (blockId.startsWith('polygon_') && blockId.includes('_')) {
    const parts = blockId.replace('polygon_', '').split('_');
    const street = parts[0];
    const timeString = parts[1];
    return { 
      street, 
      timeString,
      approximateTime: timeString
    };
  }
  return null;
};

const parseAddress = (address) => {
  const timeStreetMatch = address.match(/(\d{1,2}):(\d{2})\s*&\s*(Esplanade|[A-K])/);
  if (timeStreetMatch) {
    const [_, hour, minute, street] = timeStreetMatch;
    return {
      street,
      hour: parseInt(hour),
      minute: parseInt(minute),
      quarter: null,
      isPlaza: false
    };
  }
  return null;
};

const campInBlock = (campAddress, blockId) => {
  const { street, approximateTime } = parseBlockId(blockId);
  const parsedAddress = parseAddress(campAddress);
  
  if (!parsedAddress) return false;
  if (parsedAddress.street !== street) return false;
  
  const campTime = parsedAddress.hour + parsedAddress.minute / 60;
  const blockTimeParts = approximateTime.split(':');
  const blockTime = parseInt(blockTimeParts[0]) + parseInt(blockTimeParts[1]) / 60;
  
  return Math.abs(campTime - blockTime) < 0.1;
};

console.log('🧪 Testing Tolerance Edge Cases...\n');

const testCases = [
  {
    name: 'Exact match',
    address: '3:00 & E',
    block: 'polygon_E_3:00',
    shouldMatch: true
  },
  {
    name: 'Very close (3 minutes off)',
    address: '3:03 & E', // This shouldn't happen due to normalization, but testing tolerance
    block: 'polygon_E_3:00',
    shouldMatch: true // 0.05 hours < 0.1
  },
  {
    name: 'Just within tolerance (5 minutes)',
    address: '3:05 & E',
    block: 'polygon_E_3:00', 
    shouldMatch: true // 0.083 hours < 0.1
  },
  {
    name: 'Just outside tolerance (7 minutes)',
    address: '3:07 & E',
    block: 'polygon_E_3:00',
    shouldMatch: false // 0.117 hours > 0.1
  },
  {
    name: 'Adjacent block (15 minutes off)',
    address: '3:15 & F',
    block: 'polygon_F_3:00',
    shouldMatch: false // 0.25 hours > 0.1
  }
];

testCases.forEach(testCase => {
  const matches = campInBlock(testCase.address, testCase.block);
  const result = matches === testCase.shouldMatch ? '✅ PASS' : '❌ FAIL';
  
  console.log(`${result} ${testCase.name}`);
  console.log(`   Address: "${testCase.address}" vs Block: ${testCase.block}`);
  console.log(`   Expected: ${testCase.shouldMatch ? 'match' : 'no match'}, Got: ${matches ? 'match' : 'no match'}`);
  console.log('');
});

console.log('💡 Note: With address normalization, most of these edge cases');
console.log('   should not occur in practice, but tolerance testing ensures');
console.log('   no camps appear in multiple blocks.');