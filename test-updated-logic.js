#!/usr/bin/env node

// Test the updated address logic
const roundToNearestBlockTime = (timeStr, street) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Different intervals for different streets
  let standardMinutes;
  if (['Esplanade', 'A', 'B', 'C', 'D', 'E'].includes(street.toUpperCase())) {
    // Inner streets: 30-minute intervals
    standardMinutes = [0, 30];
  } else {
    // Outer streets (F through K): 15-minute intervals  
    standardMinutes = [0, 15, 30, 45];
  }
  
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
  
  // Check if it's in "time & street" format (preferred format)
  const timeStreetMatch = trimmed.match(/^(\d{1,2}:\d{2})\s*(&|and)\s*([A-L]|Esplanade)$/i);
  if (timeStreetMatch) {
    const time = timeStreetMatch[1];
    const street = timeStreetMatch[3];
    const roundedTime = roundToNearestBlockTime(time, street);
    return `${roundedTime} & ${street.toUpperCase()}`;
  }
  
  // Check if it's in "street & time" format and convert to "time & street"
  const streetTimeMatch = trimmed.match(/^([A-L]|Esplanade)\s*(&|and)\s*(\d{1,2}:\d{2})$/i);
  if (streetTimeMatch) {
    const street = streetTimeMatch[1];
    const time = streetTimeMatch[3];
    const roundedTime = roundToNearestBlockTime(time, street);
    return `${roundedTime} & ${street.toUpperCase()}`;
  }
  
  // Return as-is for plaza addresses or other formats
  return trimmed;
};

console.log('🔄 Testing Updated Address Logic...\n');

// Test cases showing different rounding for inner vs outer streets
const testCases = [
  // Inner streets (30-minute intervals)
  'E & 6:15',       // Should → 6:00 & E (rounds to :00)
  '6:15 & E',       // Should → 6:00 & E (already time & street format)
  'E & 6:22',       // Should → 6:30 & E (rounds to :30)
  'D & 7:15',       // Should → 7:00 & D (rounds to :00)
  
  // Outer streets (15-minute intervals)
  'F & 6:15',       // Should → 6:15 & F (stays at :15)
  'F & 6:22',       // Should → 6:15 & F (rounds to :15)
  'G & 3:38',       // Should → 3:30 & G (rounds to :30)
  'H & 4:52',       // Should → 4:45 & H (rounds to :45)
  'J & 3:00',       // Should → 3:00 & J (stays at :00)
  
  // Test format conversion
  '4:30 & F',       // Should → 4:30 & F (already correct)
  'F & 4:30',       // Should → 4:30 & F (converted from street & time)
];

testCases.forEach(testCase => {
  const result = normalizeAddress(testCase);
  console.log(`  "${testCase}" → "${result}"`);
});

console.log('\n🎯 Key test cases:');
console.log(`  E & 6:15 → ${normalizeAddress('E & 6:15')} (inner street: should round to 6:00)`);
console.log(`  F & 6:15 → ${normalizeAddress('F & 6:15')} (outer street: should stay 6:15)`);
console.log(`  E & 6:22 → ${normalizeAddress('E & 6:22')} (inner street: should round to 6:30)`);
console.log(`  F & 6:22 → ${normalizeAddress('F & 6:22')} (outer street: should round to 6:15)`);