#!/usr/bin/env node

// Test the full address pipeline: normalize → parse → blockId

// Copy the functions from airtableClient.js
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

const isValidAddress = (address) => {
  if (!address || typeof address !== 'string') return false;
  
  const timeStreetPattern = /^(\d{1,2}:[0-5]\d)\s*&\s*(Esplanade|[A-L])$/;
  if (timeStreetPattern.test(address.trim())) return true;
  
  const streetTimePattern = /^(Esplanade|[A-L])\s*&\s*(\d{1,2}:[0-5]\d)$/;
  if (streetTimePattern.test(address.trim())) return true;
  
  const plazaPattern = /^(\d{1,2}:\d{2})\s*Plaza(?:\s*Quarter\s*([A-D]))?$/i;
  if (plazaPattern.test(address.trim())) return true;
  
  return false;
};

const parseAddress = (address) => {
  if (!isValidAddress(address)) return null;
  
  const timeStreetMatch = address.trim().match(/^(\d{1,2}:[0-5]\d)\s*&\s*(Esplanade|[A-L])$/);
  if (timeStreetMatch) {
    return {
      street: timeStreetMatch[2],
      time: timeStreetMatch[1],
      blockId: `polygon_${timeStreetMatch[2]}_${timeStreetMatch[1]}`,
      type: 'street'
    };
  }
  
  const streetTimeMatch = address.trim().match(/^(Esplanade|[A-L])\s*&\s*(\d{1,2}:[0-5]\d)$/);
  if (streetTimeMatch) {
    return {
      street: streetTimeMatch[1],
      time: streetTimeMatch[2],
      blockId: `polygon_${streetTimeMatch[1]}_${streetTimeMatch[2]}`,
      type: 'street'
    };
  }
  
  return null;
};

console.log('🔄 Testing Full Address Pipeline...\n');

// Test with actual problematic addresses from Airtable
const testAddresses = [
  '7:15 & D',     // fruitPOP (should → 7:00 & D → polygon_D_7:00)
  '4:30 & F',     // Decadent Oasis (should → 4:30 & F → polygon_F_4:30)
  '3:00 & J',     // Fruit & Veggie (should → 3:00 & J → polygon_J_3:00)
  '2:30 & F',     // SloMoth (should → 2:30 & F → polygon_F_2:30)
];

testAddresses.forEach(rawAddr => {
  console.log(`📍 Raw address: "${rawAddr}"`);
  
  const normalized = normalizeAddress(rawAddr);
  console.log(`   Normalized: "${normalized}"`);
  
  const parsed = parseAddress(normalized);
  console.log(`   Parsed: ${parsed ? JSON.stringify(parsed) : 'null'}`);
  
  if (parsed) {
    console.log(`   ✅ BlockId: ${parsed.blockId}`);
  } else {
    console.log(`   ❌ Failed to parse`);
  }
  console.log('');
});

// Test the reverse - what do the polygon IDs actually look like?
console.log('🗺️  Expected polygon IDs in SVG:');
console.log('   polygon_D_7:00');
console.log('   polygon_F_4:30');
console.log('   polygon_J_3:00');
console.log('   polygon_F_2:30');