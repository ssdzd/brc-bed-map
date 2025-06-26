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

// Transform Airtable record to match our data structure
const transformRecord = (record) => {
  const fields = record.fields;
  
  return {
    id: record.id,
    camp_name: fields['Camp Name'] || fields.camp_name || '',
    placement_address: fields['Matched Address'] || fields.placement_address || fields['Placement Address'] || fields.address || '',
    bed_status: fields['Status'] || fields.bed_status || fields['BED Status'] || 'none',
    user_name: fields.user_name || fields['Contact Name'] || '',
    email: fields.email || fields['Email'] || '',
    buddy_name: fields.buddy_name || fields['Buddy Name'] || null,
    last_updated: fields.last_updated || fields['Last Updated'] || record.modifiedTime,
    notes: fields.notes || fields['Notes'] || null,
    created_at: fields.created_at || fields['Created At'] || record.createdTime
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
    console.error('Error fetching camps from Airtable:', error);
    throw error;
  }
};

// Get valid placement addresses from our polygon system
export const getValidAddresses = () => {
  const addresses = [];
  
  // Street addresses
  const streets = ['Esplanade', 'A', 'B', 'C', 'D', 'E', 'F'];
  const times = [];
  
  // Generate times from 2:00 to 10:00
  for (let hour = 2; hour <= 10; hour++) {
    times.push(`${hour}:00`);
    if (hour <= 9) {
      times.push(`${hour}:15`);
      times.push(`${hour}:30`);
      times.push(`${hour}:45`);
    }
  }
  
  streets.forEach(street => {
    times.forEach(time => {
      addresses.push(`${street} & ${time}`);
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
  
  return addresses.sort();
};

// Validate placement address format
export const isValidAddress = (address) => {
  if (!address || typeof address !== 'string') return false;
  
  // Check for street addresses (e.g., "C & 3:45")
  const streetPattern = /^(Esplanade|[A-F])\s*&\s*(\d{1,2}:[0-5]\d)$/;
  if (streetPattern.test(address.trim())) return true;
  
  // Check for plaza addresses (e.g., "3:00 Plaza", "3:00 Plaza Quarter A")
  const plazaPattern = /^(\d{1,2}:\d{2})\s*Plaza(?:\s*Quarter\s*([A-D]))?$/i;
  if (plazaPattern.test(address.trim())) return true;
  
  return false;
};

// Parse placement address to extract street and time
export const parseAddress = (address) => {
  if (!isValidAddress(address)) return null;
  
  // Parse street addresses
  const streetMatch = address.trim().match(/^(Esplanade|[A-F])\s*&\s*(\d{1,2}:[0-5]\d)$/);
  if (streetMatch) {
    return {
      street: streetMatch[1],
      time: streetMatch[2],
      blockId: `polygon_${streetMatch[1]}_${streetMatch[2]}`,
      type: 'street'
    };
  }
  
  // Parse plaza addresses
  const plazaMatch = address.trim().match(/^(\d{1,2}:\d{2})\s*Plaza(?:\s*Quarter\s*([A-D]))?$/i);
  if (plazaMatch) {
    return {
      street: 'Plaza',
      time: plazaMatch[1],
      quarter: plazaMatch[2] || null,
      blockId: 'plaza-quarter',
      type: 'plaza'
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