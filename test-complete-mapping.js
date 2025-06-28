#!/usr/bin/env node

// Test complete address mapping from end to end

// Test the airtableClient.js functions
const roundToNearestBlockTime = (timeStr, street) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  let standardMinutes;
  if (['Esplanade', 'A', 'B', 'C', 'D', 'E'].includes(street.toUpperCase())) {
    standardMinutes = [0, 30];
  } else {
    standardMinutes = [0, 15, 30, 45];
  }
  
  let nearestMinute = standardMinutes[0];
  let minDiff = Math.abs(minutes - standardMinutes[0]);
  
  for (const stdMin of standardMinutes) {
    const diff = Math.abs(minutes - stdMin);
    if (diff < minDiff) {
      minDiff = diff;
      nearestMinute = stdMin;
    }
  }
  
  return `${hours}:${nearestMinute.toString().padStart(2, '0')}`;
};

const normalizeAddress = (address) => {
  if (!address || typeof address !== 'string') return '';
  
  const trimmed = address.trim();
  
  if (trimmed.toLowerCase().includes('null') || 
      trimmed.toLowerCase().includes('don\'t know') ||
      trimmed.toLowerCase().includes('unknown') ||
      trimmed === '') {
    return '';
  }
  
  const timeStreetMatch = trimmed.match(/^(\d{1,2}:\d{2})\s*(&|and)\s*([A-L]|Esplanade)$/i);
  if (timeStreetMatch) {
    const time = timeStreetMatch[1];
    const street = timeStreetMatch[3];
    const roundedTime = roundToNearestBlockTime(time, street);
    return `${roundedTime} & ${street.toUpperCase()}`;
  }
  
  const streetTimeMatch = trimmed.match(/^([A-L]|Esplanade)\s*(&|and)\s*(\d{1,2}:\d{2})$/i);
  if (streetTimeMatch) {
    const street = streetTimeMatch[1];
    const time = streetTimeMatch[3];
    const roundedTime = roundToNearestBlockTime(time, street);
    return `${roundedTime} & ${street.toUpperCase()}`;
  }
  
  const streetSpaceTimeMatch = trimmed.match(/^([A-L]|Esplanade)\s+(\d{1,2}:\d{2})$/i);
  if (streetSpaceTimeMatch) {
    const street = streetSpaceTimeMatch[1];
    const time = streetSpaceTimeMatch[2];
    const roundedTime = roundToNearestBlockTime(time, street);
    return `${roundedTime} & ${street.toUpperCase()}`;
  }
  
  const malformedMatch = trimmed.match(/^(\d{1,2})\s*&\s*([A-L]|Esplanade)$/i);
  if (malformedMatch) {
    const hour = malformedMatch[1];
    const street = malformedMatch[2];
    const time = `${hour}:00`;
    const roundedTime = roundToNearestBlockTime(time, street);
    return `${roundedTime} & ${street.toUpperCase()}`;
  }
  
  return '';
};

const parseAddressAirtable = (address) => {
  const timeStreetMatch = address.trim().match(/^(\d{1,2}:[0-5]\d)\s*&\s*(Esplanade|[A-L])$/);
  if (timeStreetMatch) {
    return {
      street: timeStreetMatch[2],
      time: timeStreetMatch[1],
      blockId: `polygon_${timeStreetMatch[2]}_${timeStreetMatch[1]}`,
      type: 'street'
    };
  }
  return null;
};

// Test blockUtils.js functions
const parseAddressBlockUtils = (address) => {
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

const blockIdToDisplayAddress = (blockId) => {
  // Mock parseBlockId
  const parts = blockId.replace('polygon_', '').split('_');
  const street = parts[0];
  const timeString = parts[1];
  return `${timeString} & ${street}`;
};

console.log('🔄 Testing Complete Address Mapping Pipeline...\n');

// Test cases based on actual problematic addresses
const testCases = [
  {
    name: 'fruitPOP',
    rawAddress: '7:15 and D',
    expectedBlock: 'polygon_D_7:00' // Should round to 7:00 for inner street
  },
  {
    name: 'Decadent Oasis',
    rawAddress: '4:30 & F', 
    expectedBlock: 'polygon_F_4:30' // Should stay 4:30 for outer street
  },
  {
    name: 'Fruit & Veggie Camp',
    rawAddress: '3&J',
    expectedBlock: 'polygon_J_3:00' // Should parse as 3:00 & J
  },
  {
    name: 'SloMoth',
    rawAddress: 'F 2:30',
    expectedBlock: 'polygon_F_2:30' // Should parse space format
  }
];

testCases.forEach(testCase => {
  console.log(`🏕️  Testing: ${testCase.name}`);
  console.log(`   Raw address: "${testCase.rawAddress}"`);
  
  // Step 1: Normalize address (airtableClient.js)
  const normalized = normalizeAddress(testCase.rawAddress);
  console.log(`   1. Normalized: "${normalized}"`);
  
  // Step 2: Parse with airtableClient.js parseAddress
  const airtableParsed = parseAddressAirtable(normalized);
  console.log(`   2. Airtable parsed: ${airtableParsed ? airtableParsed.blockId : 'null'}`);
  
  // Step 3: Parse with blockUtils.js parseAddress  
  const blockUtilsParsed = parseAddressBlockUtils(normalized);
  console.log(`   3. BlockUtils parsed: ${blockUtilsParsed ? `${blockUtilsParsed.street} ${blockUtilsParsed.hour}:${blockUtilsParsed.minute.toString().padStart(2, '0')}` : 'null'}`);
  
  // Step 4: Test display format
  if (airtableParsed) {
    const displayAddr = blockIdToDisplayAddress(airtableParsed.blockId);
    console.log(`   4. Display format: "${displayAddr}"`);
    
    // Final verification
    const matches = airtableParsed.blockId === testCase.expectedBlock;
    console.log(`   ✅ Expected: ${testCase.expectedBlock}`);
    console.log(`   ${matches ? '✅' : '❌'} Result: ${matches ? 'PASS' : 'FAIL'}`);
  }
  
  console.log('');
});

console.log('🎯 Key Tests:');
console.log('   1. Inner streets (D) should round :15 to :00');
console.log('   2. Outer streets (F,J) should keep :15 and :30');
console.log('   3. Malformed addresses should be parsed correctly');
console.log('   4. All addresses should be in "time & street" format');
console.log('   5. BlockIds should match polygon IDs in SVG');