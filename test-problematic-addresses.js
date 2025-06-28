#!/usr/bin/env node

// Test problematic addresses found in the data
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
  
  // Skip obviously invalid addresses
  if (trimmed.toLowerCase().includes('null') || 
      trimmed.toLowerCase().includes('don\'t know') ||
      trimmed.toLowerCase().includes('unknown') ||
      trimmed === '') {
    return '';
  }
  
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
  
  // Handle "street space time" format (e.g., "F 2:30")
  const streetSpaceTimeMatch = trimmed.match(/^([A-L]|Esplanade)\s+(\d{1,2}:\d{2})$/i);
  if (streetSpaceTimeMatch) {
    const street = streetSpaceTimeMatch[1];
    const time = streetSpaceTimeMatch[2];
    const roundedTime = roundToNearestBlockTime(time, street);
    return `${roundedTime} & ${street.toUpperCase()}`;
  }
  
  // Handle malformed addresses like "3&J" (missing time, assume :00)
  const malformedMatch = trimmed.match(/^(\d{1,2})\s*&\s*([A-L]|Esplanade)$/i);
  if (malformedMatch) {
    const hour = malformedMatch[1];
    const street = malformedMatch[2];
    const time = `${hour}:00`;
    const roundedTime = roundToNearestBlockTime(time, street);
    return `${roundedTime} & ${street.toUpperCase()}`;
  }
  
  // Return empty string for unrecognized formats
  return '';
};

console.log('🚨 Testing Problematic Addresses Found in Data...\n');

// Test the actual problematic addresses
const problematicAddresses = [
  '7:15 & D',       // fruitPOP - should round to 7:00 & D (inner street)
  '7:15 and D',     // same address with "and"
  '3:00 & J',       // fruit & veggie camp - should stay 3:00 & J (outer street)
  '3&J',            // malformed address - missing time
  '2:30 & F',       // SloMoth - should stay 2:30 & F (outer street)  
  'F 2:30',         // wrong format (space instead of &)
  "don't know yet", // invalid address
  'null',           // invalid address
  '',               // empty address
];

problematicAddresses.forEach(addr => {
  const result = normalizeAddress(addr);
  console.log(`  "${addr}" → "${result}"`);
});

console.log('\n🎯 Expected results:');
console.log(`  "7:15 & D" should → "7:00 & D" (inner street rounds :15 to :00)`);
console.log(`  "3:00 & J" should → "3:00 & J" (outer street, already correct)`);
console.log(`  "2:30 & F" should → "2:30 & F" (outer street, already correct)`);
console.log(`  Invalid addresses should → empty string or unchanged`);

console.log('\n🔍 Analysis:');
console.log(`  - fruitPOP has 7:15 & D, should round to 7:00 & D`);
console.log(`  - There are TWO fruitPOP camps (duplicate entries)`);
console.log(`  - Some addresses are malformed and won't match any polygons`);