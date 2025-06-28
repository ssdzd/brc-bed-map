#!/usr/bin/env node

// Test time rounding logic
const roundToNearestBlockTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Standard block times are at :00 and :30 only (based on actual polygon structure)
  const standardMinutes = [0, 30];
  
  // Find the nearest standard minute
  let nearestMinute = standardMinutes[0];
  let minDiff = Math.abs(minutes - standardMinutes[0]);
  
  for (const stdMin of standardMinutes) {
    const diff = Math.abs(minutes - stdMin);
    if (diff < minDiff) {
      minDiff = diff;
      nearestMinute = stdMin;
    }
  }
  
  // Format the time with leading zeros
  return `${hours}:${nearestMinute.toString().padStart(2, '0')}`;
};

const normalizeAddress = (address) => {
  if (!address || typeof address !== 'string') return '';
  
  const trimmed = address.trim();
  
  // Check if it's in "time & street" format and convert to "street & time"
  const timeStreetMatch = trimmed.match(/^(\d{1,2}:\d{2})\s*(&|and)\s*([A-L]|Esplanade)$/i);
  if (timeStreetMatch) {
    const time = timeStreetMatch[1];
    const street = timeStreetMatch[3];
    const roundedTime = roundToNearestBlockTime(time);
    return `${street.toUpperCase()} & ${roundedTime}`;
  }
  
  // Check if it's already in "street & time" format and normalize case
  const streetTimeMatch = trimmed.match(/^([A-L]|Esplanade)\s*(&|and)\s*(\d{1,2}:\d{2})$/i);
  if (streetTimeMatch) {
    const street = streetTimeMatch[1];
    const time = streetTimeMatch[3];
    const roundedTime = roundToNearestBlockTime(time);
    return `${street.toUpperCase()} & ${roundedTime}`;
  }
  
  // Return as-is for plaza addresses or other formats
  return trimmed;
};

console.log('🕐 Testing Time Rounding Logic...\n');

// Test cases
const testCases = [
  'E & 6:15',   // Should round to E & 6:15 (already standard)
  '6:15 & E',   // Should convert and round to E & 6:15
  'E & 6:12',   // Should round to E & 6:15 (closest)
  'E & 6:08',   // Should round to E & 6:00 (closest)
  'E & 6:22',   // Should round to E & 6:15 (closest)
  'E & 6:38',   // Should round to E & 6:30 (closest)
  'F & 4:30',   // Should stay F & 4:30 (already standard)
  '7:07 & D',   // Should round to D & 7:00
  'C & 3:53',   // Should round to C & 4:00
];

testCases.forEach(testCase => {
  const result = normalizeAddress(testCase);
  console.log(`  "${testCase}" → "${result}"`);
});

console.log('\n🎯 Specific test for E & 6:15:');
const specificTest = normalizeAddress('E & 6:15');
console.log(`  "E & 6:15" → "${specificTest}"`);

if (specificTest === 'E & 6:15') {
  console.log('✅ Correct! 6:15 is already a standard time.');
} else {
  console.log('❌ Unexpected result.');
}

// Test what you mentioned - should it round to 6:00?
console.log('\n🤔 If 6:15 should round to 6:00 instead:');
const roundDown = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Round down to the nearest 15-minute interval
  const roundedMinutes = Math.floor(minutes / 15) * 15;
  
  return `${hours}:${roundedMinutes.toString().padStart(2, '0')}`;
};

console.log(`  "6:15" with round-down logic → "${roundDown('6:15')}"`);
console.log(`  "6:22" with round-down logic → "${roundDown('6:22')}"`);
console.log(`  "6:08" with round-down logic → "${roundDown('6:08')}"`);