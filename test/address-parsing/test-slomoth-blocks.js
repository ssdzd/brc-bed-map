#!/usr/bin/env node

// Test SloMoth specific block matching issue

// Mock the campInBlock function logic
const parseBlockId = (blockId) => {
  // Handle new polygon format: "polygon_F_2:30"
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
  // Handle time & street format (new format)
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
  
  // Handle old format for backward compatibility
  const streetTimeMatch = address.match(/(Esplanade|[A-K])\s*&\s*(\d{1,2}):(\d{2})/);
  if (streetTimeMatch) {
    const [_, street, hour, minute] = streetTimeMatch;
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
  
  // Check street match
  if (parsedAddress.street !== street) return false;
  
  // Check if time is within block range
  const campTime = parsedAddress.hour + parsedAddress.minute / 60;
  
  // Parse block time
  const blockTimeParts = approximateTime.split(':');
  const blockTime = parseInt(blockTimeParts[0]) + parseInt(blockTimeParts[1]) / 60;
  
  // Since addresses are now normalized to exact block times, require exact match (or very close)
  return Math.abs(campTime - blockTime) < 0.1;
};

console.log('🔍 Testing SloMoth Block Matching...\n');

const slomothAddress = '2:30 & F';
const testBlocks = [
  'polygon_F_2:15',
  'polygon_F_2:30', 
  'polygon_F_2:45'
];

console.log(`SloMoth address: "${slomothAddress}"`);

const parsedAddr = parseAddress(slomothAddress);
console.log(`Parsed address: Hour=${parsedAddr.hour}, Minute=${parsedAddr.minute}, Street=${parsedAddr.street}`);
console.log(`Camp time as decimal: ${parsedAddr.hour + parsedAddr.minute / 60} hours\n`);

testBlocks.forEach(blockId => {
  const blockInfo = parseBlockId(blockId);
  const blockTimeParts = blockInfo.approximateTime.split(':');
  const blockTime = parseInt(blockTimeParts[0]) + parseInt(blockTimeParts[1]) / 60;
  const campTime = parsedAddr.hour + parsedAddr.minute / 60;
  const timeDiff = Math.abs(campTime - blockTime);
  const matches = campInBlock(slomothAddress, blockId);
  
  console.log(`Block: ${blockId}`);
  console.log(`  Block time: ${blockInfo.approximateTime} (${blockTime} hours)`);
  console.log(`  Time difference: ${timeDiff} hours`);
  console.log(`  Matches (< 0.1): ${matches ? '✅ YES' : '❌ NO'}`);
  console.log('');
});

console.log('🎯 Expected result: Only polygon_F_2:30 should match');