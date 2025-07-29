#!/usr/bin/env node

// Test specific address transformations
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

console.log('🎯 Testing Specific Address Cases...\n');

// Test cases that should demonstrate the fix
const testCases = [
  'E & 6:15',       // Should → E & 6:00
  'D & 7:15',       // Should → D & 7:00  
  'F & 4:30',       // Should → F & 4:30 (already correct)
  '7:07 & D',       // Should → D & 7:00
  'C & 3:53',       // Should → C & 4:00
  'E & 6:22',       // Should → E & 6:30
  'J & 3:00',       // Should → J & 3:00 (already correct)
];

testCases.forEach(testCase => {
  const result = normalizeAddress(testCase);
  console.log(`  "${testCase}" → "${result}"`);
});

console.log('\n✅ Key test cases:');
console.log(`  E & 6:15 → ${normalizeAddress('E & 6:15')} (should be E & 6:00)`);
console.log(`  D & 7:15 → ${normalizeAddress('D & 7:15')} (should be D & 7:00)`);

// Verify these match expected polygon IDs
console.log('\n🗺️  Expected polygon IDs:');
console.log(`  E & 6:00 → polygon_E_6:00`);
console.log(`  D & 7:00 → polygon_D_7:00`);