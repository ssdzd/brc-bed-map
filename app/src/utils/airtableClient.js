// Airtable API client for B.E.D. Map data
// Handles authentication, data fetching, and response transformation

const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0';

// Airtable configuration from environment variables
const AIRTABLE_CONFIG = {
  baseId: import.meta.env.VITE_AIRTABLE_BASE_ID,
  tableName: import.meta.env.VITE_AIRTABLE_TABLE_NAME || 'BED_Camp_Progress',
  pat: import.meta.env.VITE_AIRTABLE_PAT
};

// Validate configuration
const validateConfig = () => {
  const missing = [];
  if (!AIRTABLE_CONFIG.baseId) missing.push('VITE_AIRTABLE_BASE_ID');
  if (!AIRTABLE_CONFIG.pat) missing.push('VITE_AIRTABLE_PAT');
  
  if (missing.length > 0) {
    throw new Error(`Missing Airtable configuration: ${missing.join(', ')}`);
  }
};

// Create headers for Airtable API requests
const createHeaders = () => ({
  'Authorization': `Bearer ${AIRTABLE_CONFIG.pat}`,
  'Content-Type': 'application/json'
});

// Map Airtable status values to BED status
const mapStatusToBedStatus = (airtableStatus) => {
  if (!airtableStatus) return 'none';
  
  const status = airtableStatus.toLowerCase();
  switch (status) {
    case 'orange':
      return 'registered';
    case 'purple':
      return 'consent_policy';
    case 'pink':
    case 'hot pink':
      return 'bed_talk';
    case 'gray':
    case 'grey':
    default:
      return 'none';
  }
};

// Round time to nearest standard block time based on street
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

// Normalize address format (keep as "time & street" format)
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
  
  // Check if it's a geographic plaza quarter name (e.g., "9:01 & B+", "7:29 & G-")
  const geographicQuarterMatch = trimmed.match(/^(\d{1,2}:\d{2})\s*(&|and)\s*([A-G])([+-])$/i);
  if (geographicQuarterMatch) {
    const time = geographicQuarterMatch[1];
    const street = geographicQuarterMatch[3];
    const direction = geographicQuarterMatch[4];
    // Don't round time for geographic quarters - they're already specific
    return `${time} & ${street.toUpperCase()}${direction}`;
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

// Transform Airtable record to match our data structure
const transformRecord = (record) => {
  const fields = record.fields;
  
  // Get the original address from user input
  const originalAddress = fields['Camp Address'] || 
                         fields['Placement Address'] || 
                         fields.placement_address || 
                         fields.address || '';
  
  // Get the processed address, trying multiple field names
  let rawAddress = fields['Matched Polygon'] || 
                   fields['Camp Address copy'] || 
                   fields['Camp Address'] || 
                   fields['Placement Address'] || 
                   fields.placement_address || 
                   fields.address || '';
  
  // Handle case where Matched Polygon might have nested structure
  if (typeof rawAddress === 'object' && rawAddress.value) {
    rawAddress = rawAddress.value;
  }
  
  const normalizedAddress = normalizeAddress(rawAddress);
  
  return {
    id: record.id,
    camp_name: fields['Camp Name'] || fields.camp_name || fields['Preferred Name'] || '',
    placement_address: normalizedAddress,
    original_address: originalAddress,
    bed_status: mapStatusToBedStatus(fields['Status'] || fields.bed_status || fields['BED Status']),
    user_name: fields['Preferred Name'] || fields['Full Name'] || fields.user_name || fields['Contact Name'] || '',
    email: fields['Email'] || fields.email || '',
    buddy_name: fields.buddy_name || fields['Buddy Name'] || null,
    phone: fields['Phone Number'] || fields.phone || null,
    pronouns: fields['Pronouns'] || fields.pronouns || null,
    camper_count: fields['Number of Campers'] || fields.camper_count || null,
    wants_buddy: fields['Do you want a BED Buddy?'] === 'HELL YES!' || fields['Do you want a BED Buddy?'] === 'Yes',
    last_updated: fields.last_updated || fields['Last Updated'] || record.modifiedTime,
    notes: fields.notes || fields['Notes'] || null,
    created_at: fields.created_at || fields['Created At'] || fields['Timestamp'] || record.createdTime
  };
};

// Fetch all camps from Airtable
export const fetchCamps = async () => {
  validateConfig();
  
  const url = `${AIRTABLE_BASE_URL}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}`;
  
  try {
    let allRecords = [];
    let offset = null;
    
    // Handle pagination
    do {
      const params = new URLSearchParams();
      if (offset) params.append('offset', offset);
      
      const response = await fetch(`${url}?${params}`, {
        headers: createHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      allRecords = allRecords.concat(data.records || []);
      offset = data.offset;
      
    } while (offset);
    
    // Transform records to match our data structure
    return allRecords.map(transformRecord);
    
  } catch (error) {
    // Error is propagated to caller for handling
    throw error;
  }
};

// Get valid placement addresses from our polygon system
export const getValidAddresses = () => {
  const addresses = [];
  
  // Street addresses
  const streets = ['Esplanade', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const times = [];
  
  // Generate times from 2:00 to 10:00 with appropriate intervals
  for (let hour = 2; hour <= 10; hour++) {
    times.push(`${hour}:00`);
    if (hour <= 9) {
      times.push(`${hour}:30`);
      // Outer streets (F-L) also have :15 and :45
      times.push(`${hour}:15`);
      times.push(`${hour}:45`);
    }
  }
  
  streets.forEach(street => {
    // Filter times based on street type
    let validTimes;
    if (['Esplanade', 'A', 'B', 'C', 'D', 'E'].includes(street)) {
      // Inner streets: only :00 and :30
      validTimes = times.filter(time => time.endsWith(':00') || time.endsWith(':30'));
    } else {
      // Outer streets: all intervals
      validTimes = times;
    }
    
    validTimes.forEach(time => {
      addresses.push(`${time} & ${street}`);
    });
  });
  
  // Plaza addresses
  const plazaTimes = ['3:00', '4:30', '6:00', '7:30', '9:00'];
  const quarters = ['A', 'B', 'C', 'D'];
  
  plazaTimes.forEach(time => {
    // General plaza addresses
    addresses.push(`${time} Plaza`);
    
    // Specific quarter addresses
    quarters.forEach(quarter => {
      addresses.push(`${time} Plaza Quarter ${quarter}`);
    });
  });
  
  // Center Camp addresses
  addresses.push('Center Camp Plaza');
  quarters.forEach(quarter => {
    addresses.push(`Center Camp Quarter ${quarter}`);
  });
  
  // Geographic plaza quarter names
  const geographicQuarters = [
    '5:59 & A+', '5:59 & A-', '6:01 & A-', '6:01 & A+',
    '5:59 & G+', '5:59 & G-', '6:01 & G-', '6:01 & G+',
    '3:01 & B+', '2:59 & B+', '2:59 & B-', '3:01 & B-',
    '3:01 & G+', '2:59 & G+', '2:59 & G-', '3:01 & G-',
    '8:59 & B-', '9:01 & B-', '9:01 & B+', '8:59 & B+',
    '8:59 & G-', '9:01 & G-', '9:01 & G+', '8:59 & G+',
    '7:29 & B+', '7:29 & B-', '7:31 & B-', '7:31 & B+',
    '7:29 & G+', '7:29 & G-', '7:31 & G-', '7:31 & G+',
    '4:31 & B+', '4:29 & B+', '4:29 & B-', '4:31 & B-',
    '4:31 & G+', '4:29 & G+', '4:29 & G-', '4:31 & G-'
  ];
  
  addresses.push(...geographicQuarters);
  
  return addresses.sort();
};

// Validate placement address format
export const isValidAddress = (address) => {
  if (!address || typeof address !== 'string') return false;
  
  // Check for time & street addresses (e.g., "3:45 & C" or "9 & C")
  const timeStreetPattern = /^(\d{1,2}(?::[0-5]\d)?)\s*&\s*(Esplanade|[A-L])$/i;
  if (timeStreetPattern.test(address.trim())) return true;
  
  // Check for street & time addresses (e.g., "C & 3:45" or "C & 9") - also valid
  const streetTimePattern = /^(Esplanade|[A-L])\s*&\s*(\d{1,2}(?::[0-5]\d)?)$/i;
  if (streetTimePattern.test(address.trim())) return true;
  
  // Check for geographic plaza quarter names (e.g., "9:01 & B+", "7:29 & G-")
  const geographicQuarterPattern = /^(\d{1,2}:[0-5]\d)\s*&\s*([A-G])([+-])$/i;
  if (geographicQuarterPattern.test(address.trim())) return true;
  
  // Check for plaza addresses (e.g., "3:00 Plaza", "3:00 Plaza Quarter A")
  const plazaPattern = /^(\d{1,2}:\d{2})\s*Plaza(?:\s*Quarter\s*([A-D]))?$/i;
  if (plazaPattern.test(address.trim())) return true;
  
  return false;
};

// Parse placement address to extract street and time
export const parseAddress = (address) => {
  if (!isValidAddress(address)) return null;
  
  // Parse geographic plaza quarter names (e.g., "9:01 & B+", "7:29 & G-")
  const geographicQuarterMatch = address.trim().match(/^(\d{1,2}:[0-5]\d)\s*&\s*([A-G])([+-])$/i);
  if (geographicQuarterMatch) {
    const [_, time, street, direction] = geographicQuarterMatch;
    const geographicName = `${time} & ${street}${direction}`;
    
    // Find the corresponding block ID from the PLAZA_QUARTER_MAPPING
    // We need to import this function from blockUtils.js
    return {
      street: 'Geographic Plaza Quarter',
      time: time,
      geographicName: geographicName,
      blockId: null, // Will be resolved by getBlockIdFromGeographicName
      type: 'geographic_plaza'
    };
  }
  
  // Parse time & street addresses (e.g., "3:45 & C" or "9 & C")
  const timeStreetMatch = address.trim().match(/^(\d{1,2}(?::[0-5]\d)?)\s*&\s*(Esplanade|[A-L])$/i);
  if (timeStreetMatch) {
    // Normalize time format (add :00 if missing)
    const normalizedTime = timeStreetMatch[1].includes(':') ? timeStreetMatch[1] : `${timeStreetMatch[1]}:00`;
    // Normalize street case for block ID
    const normalizedStreet = timeStreetMatch[2].charAt(0).toUpperCase() + timeStreetMatch[2].slice(1).toLowerCase();
    return {
      street: normalizedStreet,
      time: normalizedTime,
      blockId: `polygon_${normalizedStreet}_${normalizedTime}`,
      type: 'street'
    };
  }
  
  // Parse street & time addresses (e.g., "C & 3:45" or "C & 9") 
  const streetTimeMatch = address.trim().match(/^(Esplanade|[A-L])\s*&\s*(\d{1,2}(?::[0-5]\d)?)$/i);
  if (streetTimeMatch) {
    // Normalize time format (add :00 if missing)
    const normalizedTime = streetTimeMatch[2].includes(':') ? streetTimeMatch[2] : `${streetTimeMatch[2]}:00`;
    // Normalize street case for block ID
    const normalizedStreet = streetTimeMatch[1].charAt(0).toUpperCase() + streetTimeMatch[1].slice(1).toLowerCase();
    return {
      street: normalizedStreet,
      time: normalizedTime,
      blockId: `polygon_${normalizedStreet}_${normalizedTime}`,
      type: 'street'
    };
  }
  
  // Parse plaza addresses (with optional quarter and ring designation)
  const plazaMatch = address.trim().match(/^(\d{1,2}:\d{2})\s*([BG])?\s*Plaza(?:\s*Quarter\s*([A-D]))?$/i);
  if (plazaMatch) {
    const time = plazaMatch[1];
    const ring = plazaMatch[2] || 'B'; // Default to B ring if not specified
    const quarter = plazaMatch[3] || null;
    
    // Generate appropriate block ID based on whether quarter is specified
    let blockId;
    if (quarter) {
      blockId = `plaza_${time}_${ring}_Quarter_${quarter}`;
    } else {
      // For general plaza addresses, we'll match any quarter in that plaza
      blockId = `plaza_${time}_${ring}`;
    }
    
    return {
      street: 'Plaza',
      time: time,
      ring: ring,
      quarter: quarter,
      blockId: blockId,
      type: 'plaza'
    };
  }
  
  // Parse Center Camp addresses
  const centerCampMatch = address.trim().match(/^Center\s*Camp(?:\s*Quarter\s*([A-D]))?$/i);
  if (centerCampMatch) {
    const quarter = centerCampMatch[1] || null;
    
    let blockId;
    if (quarter) {
      blockId = `plaza_Center_Camp_Quarter_${quarter}`;
    } else {
      blockId = `plaza_Center_Camp`;
    }
    
    return {
      street: 'Center Camp',
      time: null,
      ring: null,
      quarter: quarter,
      blockId: blockId,
      type: 'center_camp'
    };
  }
  
  return null;
};

// Check Airtable connection
export const testConnection = async () => {
  try {
    validateConfig();
    
    const url = `${AIRTABLE_BASE_URL}/${AIRTABLE_CONFIG.baseId}/${AIRTABLE_CONFIG.tableName}?maxRecords=1`;
    const response = await fetch(url, {
      headers: createHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Connection test failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      success: true,
      message: 'Airtable connection successful',
      recordCount: data.records?.length || 0
    };
    
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error
    };
  }
};

// Export configuration for debugging
export const getConfig = () => ({
  baseId: AIRTABLE_CONFIG.baseId ? `${AIRTABLE_CONFIG.baseId.slice(0, 8)}...` : 'NOT_SET',
  tableName: AIRTABLE_CONFIG.tableName,
  patConfigured: !!AIRTABLE_CONFIG.pat
});