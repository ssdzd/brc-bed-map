// BED status colors - 2025 Theme (Clean/Professional)
export const BED_COLORS_2025 = {
  none: '#9CA3AF',           // Gray
  registered: '#FE8803',  // Orange
  consent_policy: '#9807AB',  // Purple
  bed_talk: '#FF1493' //  Hot pink
};

// BED status colors - 2024 Theme (Vibrant/Fun)
export const BED_COLORS_2024 = {
  none: '#F8F9FA',              // Light gray/white
  registered: '#FE8803',    // Orange
  consent_policy: '#9807AB',    // Purple  
  bed_talk: '#FF1493'  // Hot pink
};


// Default to 2024 theme
export const BED_COLORS = BED_COLORS_2024;

// Theme configurations
export const THEMES = {
  '2024': {
    name: '2024 Vibrant',
    colors: BED_COLORS_2024,
    background: 'radial-gradient(circle at center, rgba(255, 228, 225, 0.95) 0%, rgba(255, 105, 180, 0.85) 35%, rgba(139, 0, 139, 0.75) 65%, rgba(75, 0, 130, 0.65) 100%)',
    containerBg: '#FF69B4',
    textColor: '#FFFFFF',
    isDark: true,
    centerCircle: {
      background: 'linear-gradient(135deg, #FFE0F0 0%, #FFB6C1 30%, #FFC0CB 70%, #FFCCCB 100%)',
      border: '3px solid #FFFFFF',
      textColor: '#AD1457'
    },
    typography: {
      primaryFont: 'Inter, system-ui, sans-serif',
      headingFont: 'Bebas Neue, sans-serif',
      scriptFont: 'Pacifico, cursive',
      displayFont: 'Bebas Neue, sans-serif'
    }
  },
};

// Parse block ID like "polygon_A_2:00" or "A_8" into components
export const parseBlockId = (blockId) => {
  // Handle new format: "polygon_A_2:00"
  if (blockId.startsWith('polygon_')) {
    const parts = blockId.replace('polygon_', '').split('_');
    const street = parts[0];
    const timeString = parts[1];
    return { 
      street, 
      timeString,
      // Convert time string like "2:00" directly
      approximateTime: timeString
    };
  }
  
  // Handle old format: "A_8" 
  const [street, segment] = blockId.split('_');
  return { 
    street, 
    segment: parseInt(segment),
    // Rough time calculation (segment 1-40 maps to clock positions)
    approximateTime: segmentToTime(parseInt(segment))
  };
};

// Convert segment number to approximate time
const segmentToTime = (segment) => {
  // 40 segments = 12 hours (from 12:00 to 12:00)
  const hour = Math.floor((segment - 1) * 12 / 40) + 2; // Starting at 2:00
  const minute = ((segment - 1) * 12 * 60 / 40) % 60;
  return `${hour}:${minute.toString().padStart(2, '0')}`;
};

// Plaza quarter renaming mapping based on geographic orientation
const PLAZA_QUARTER_MAPPING = {
  // Center Camp: 6:00 & A Plaza (Quarter A touches 5:30 & A)
  'plaza_Center_Camp_Quarter_A': '5:59 & A+',
  'plaza_Center_Camp_Quarter_B': '5:59 & A-',
  'plaza_Center_Camp_Quarter_C': '6:01 & A-',
  'plaza_Center_Camp_Quarter_D': '6:01 & A+',
  
  // 6:00 & G Plaza (Quarter A touches 5:30 & G)
  'plaza_6:00_G_Quarter_A': '5:59 & G+',
  'plaza_6:00_G_Quarter_B': '5:59 & G-',
  'plaza_6:00_G_Quarter_C': '6:01 & G-',
  'plaza_6:00_G_Quarter_D': '6:01 & G+',
  
  // 3:00 & B Plaza (Quarter A touches 2:30 & B)
  'plaza_3:00_B_Quarter_A': '3:01 & B+',
  'plaza_3:00_B_Quarter_B': '2:59 & B+',
  'plaza_3:00_B_Quarter_C': '2:59 & B-',
  'plaza_3:00_B_Quarter_D': '3:01 & B-',
  
  // 3:00 & G Plaza
  'plaza_3:00_G_Quarter_A': '3:01 & G+',
  'plaza_3:00_G_Quarter_B': '2:59 & G+',
  'plaza_3:00_G_Quarter_C': '2:59 & G-',
  'plaza_3:00_G_Quarter_D': '3:01 & G-',
  
  // 9:00 & B Plaza (Quarter A touches 8:30 & A)
  'plaza_9:00_B_Quarter_A': '8:59 & B-',
  'plaza_9:00_B_Quarter_B': '9:01 & B-',
  'plaza_9:00_B_Quarter_C': '9:01 & B+',
  'plaza_9:00_B_Quarter_D': '8:59 & B+',
  
  // 9:00 & G Plaza (Quarter A touches 8:30 & F)
  'plaza_9:00_G_Quarter_A': '8:59 & G-',
  'plaza_9:00_G_Quarter_B': '9:01 & G-',
  'plaza_9:00_G_Quarter_C': '9:01 & G+',
  'plaza_9:00_G_Quarter_D': '8:59 & G+',
  
  // 7:30 & B Plaza (Quarter A touches 7:00 & B)
  'plaza_7:30_B_Quarter_A': '7:29 & B+',
  'plaza_7:30_B_Quarter_B': '7:29 & B-',
  'plaza_7:30_B_Quarter_C': '7:31 & B-',
  'plaza_7:30_B_Quarter_D': '7:31 & B+',
  
  // 7:30 & G Plaza (Quarter A touches 7:00 & G)
  'plaza_7:30_G_Quarter_A': '7:29 & G+',
  'plaza_7:30_G_Quarter_B': '7:29 & G-',
  'plaza_7:30_G_Quarter_C': '7:31 & G-',
  'plaza_7:30_G_Quarter_D': '7:31 & G+',
  
  // 4:30 & B Plaza (Quarter B touches 4:00 & B)
  'plaza_4:30_B_Quarter_A': '4:31 & B+',
  'plaza_4:30_B_Quarter_B': '4:29 & B+',
  'plaza_4:30_B_Quarter_C': '4:29 & B-',
  'plaza_4:30_B_Quarter_D': '4:31 & B-',
  
  // 4:30 & G Plaza (Quarter B touches 4:00 & G)
  'plaza_4:30_G_Quarter_A': '4:31 & G+',
  'plaza_4:30_G_Quarter_B': '4:29 & G+',
  'plaza_4:30_G_Quarter_C': '4:29 & G-',
  'plaza_4:30_G_Quarter_D': '4:31 & G-'
};

// Helper function to determine if a block should have "Sector" suffix
export const shouldAddSectorSuffix = (blockId) => {
  // Add "Sector" for normal city polygons (IDs starting with 'polygon_')
  if (blockId && blockId.startsWith('polygon_')) {
    return true;
  }
  
  // Don't add "Sector" for plaza quarters, special locations, etc.
  return false;
};

// Convert granular plaza quarter name to simplified plaza name for display
export const simplifyPlazaName = (displayAddress) => {
  // Handle BRC Airport
  if (displayAddress === 'BRC Airport') {
    return displayAddress;
  }
  
  // Handle Center Camp
  if (displayAddress === 'Center Camp') {
    return displayAddress;
  }
  
  // Convert granular plaza quarter coordinates to simplified plaza names
  // Examples: "2:59 & B+" -> "3 & B Plaza", "7:29 & G-" -> "7:30 & G Plaza", "5:59 & A+" -> "6 & A Plaza"
  const plazaQuarterMatch = displayAddress.match(/(\d{1,2}):(\d{2})\s*&\s*([A-G])([+-])/);
  if (plazaQuarterMatch) {
    const [_, hour, minute, ring] = plazaQuarterMatch;
    const hourNum = parseInt(hour);
    const minuteNum = parseInt(minute);
    
    // Map granular coordinates back to main plaza time
    let mainHour = hourNum;
    let mainMinute = 0;
    
    if (minuteNum === 59) {
      // :59 means just before the hour, so the plaza is at the next hour
      mainHour = (hourNum + 1) % 12;
      if (mainHour === 0) mainHour = 12;
    } else if (minuteNum === 1) {
      // :01 means just after the hour, so the plaza is at this hour
      mainHour = hourNum;
    } else if (minuteNum === 29) {
      // :29 means just before :30, so the plaza is at :30
      mainHour = hourNum;
      mainMinute = 30;
    } else if (minuteNum === 31) {
      // :31 means just after :30, so the plaza is at :30
      mainHour = hourNum;
      mainMinute = 30;
    }
    
    // Format the simplified plaza name
    const timeStr = mainMinute === 0 ? `${mainHour}` : `${mainHour}:30`;
    
    // Special case: 6 & A Plaza is called "Center Camp Plaza"
    if (timeStr === '6' && ring === 'A') {
      return 'Center Camp Plaza';
    }
    
    return `${timeStr} & ${ring} Plaza`;
  }
  
  // Return original address if not a plaza quarter
  return displayAddress;
};

// Convert block ID back to display format (handles both street blocks and plaza quarters)
export const blockIdToDisplayAddress = (blockId) => {
  // Handle special locations
  if (blockId === 'nimue-artist-credit') {
    return 'BRC Airport';
  }
  
  // Handle plaza quarter block IDs with new geographic naming
  if (blockId.startsWith('plaza_')) {
    // Check if this is a plaza quarter with new naming
    if (PLAZA_QUARTER_MAPPING[blockId]) {
      return PLAZA_QUARTER_MAPPING[blockId];
    }
    
    // Handle Center Camp quarters (fallback)
    const centerCampMatch = blockId.match(/^plaza_Center_Camp(?:_Quarter_([A-D]))?$/);
    if (centerCampMatch) {
      const quarter = centerCampMatch[1];
      return quarter ? `Center Camp Quarter ${quarter}` : 'Center Camp';
    }
    
    // Handle regular plaza quarters (fallback)
    const plazaMatch = blockId.match(/^plaza_(\d{1,2}:\d{2})_([BG])(?:_Quarter_([A-D]))?$/);
    if (plazaMatch) {
      const [_, time, ring, quarter] = plazaMatch;
      const baseLabel = `${time} ${ring} Plaza`;
      return quarter ? `${baseLabel} Quarter ${quarter}` : baseLabel;
    }
  }
  
  // Handle regular street blocks
  const { street, timeString } = parseBlockId(blockId);
  return `${timeString} & ${street}`;
};

// Enhanced address parsing with plaza quarter support
const parseAddress = (address) => {
  // Handle BRC Airport as a special case
  if (address.match(/BRC\s*Airport/i)) {
    return {
      street: 'BRC Airport',
      hour: null,
      minute: null,
      quarter: null,
      isPlaza: false,
      isAirport: true
    };
  }
  
  // Handle new geographic plaza quarter format like "5:59 & A+", "7:29 & G-"
  const geographicPlazaMatch = address.match(/(\d{1,2}):(\d{2})\s*&\s*([A-G])([+-])/);
  if (geographicPlazaMatch) {
    const [_, hour, minute, street, direction] = geographicPlazaMatch;
    return {
      street: street + direction, // Combined street and direction (e.g., "A+", "G-")
      hour: parseInt(hour),
      minute: parseInt(minute),
      quarter: null,
      isPlaza: true,
      isGeographicPlaza: true,
      geographicName: `${hour}:${minute} & ${street}${direction}`
    };
  }
  
  // Handle plaza quarters like "3:00 B Plaza Quarter A" or "9:00 Plaza"
  const plazaMatch = address.match(/(\d{1,2}):(\d{2})\s*([BG])?\s*Plaza(?:\s*Quarter\s*([A-D]))?/i);
  if (plazaMatch) {
    const [_, hour, minute, ring, quarter] = plazaMatch;
    return {
      street: 'Plaza',
      hour: parseInt(hour),
      minute: parseInt(minute),
      ring: ring || 'B', // Default to B ring if not specified
      quarter: quarter || null,
      isPlaza: true
    };
  }
  
  // Handle Center Camp addresses
  const centerCampMatch = address.match(/Center\s*Camp(?:\s*Quarter\s*([A-D]))?/i);
  if (centerCampMatch) {
    const [_, quarter] = centerCampMatch;
    return {
      street: 'Center Camp',
      hour: null,
      minute: null,
      ring: null,
      quarter: quarter || null,
      isPlaza: true,
      isCenterCamp: true
    };
  }
  
  // Handle regular street addresses like "3:45 & C", "9 & C", or "3:45 & Esplanade" (new format)
  const timeStreetMatch = address.match(/(\d{1,2})(?::(\d{2}))?\s*&\s*(Esplanade|[A-K])/i);
  if (timeStreetMatch) {
    const [_, hour, minute, street] = timeStreetMatch;
    // Normalize street case to match polygon IDs (Esplanade not ESPLANADE)
    const normalizedStreet = street.charAt(0).toUpperCase() + street.slice(1).toLowerCase();
    return {
      street: normalizedStreet,
      hour: parseInt(hour),
      minute: parseInt(minute || '0'), // Default to 0 if no minutes specified
      quarter: null,
      isPlaza: false
    };
  }
  
  // Also handle old format for backward compatibility "C & 3:45" or "C & 9"
  const streetTimeMatch = address.match(/(Esplanade|[A-K])\s*&\s*(\d{1,2})(?::(\d{2}))?/i);
  if (streetTimeMatch) {
    const [_, street, hour, minute] = streetTimeMatch;
    // Normalize street case to match polygon IDs (Esplanade not ESPLANADE)
    const normalizedStreet = street.charAt(0).toUpperCase() + street.slice(1).toLowerCase();
    return {
      street: normalizedStreet,
      hour: parseInt(hour),
      minute: parseInt(minute || '0'), // Default to 0 if no minutes specified
      quarter: null,
      isPlaza: false
    };
  }
  
  return null;
};

// Reverse mapping: convert geographic names back to block IDs for matching
const getBlockIdFromGeographicName = (geographicName) => {
  // Find the block ID that maps to this geographic name
  for (const [blockId, displayName] of Object.entries(PLAZA_QUARTER_MAPPING)) {
    if (displayName === geographicName) {
      return blockId;
    }
  }
  return null;
};

// Check if a camp address matches a block
export const campInBlock = (campAddress, blockId) => {
  const { street, approximateTime } = parseBlockId(blockId);
  const parsedAddress = parseAddress(campAddress);
  
  if (!parsedAddress) return false;
  
  // Handle BRC Airport
  if (parsedAddress.isAirport) {
    return blockId === 'nimue-artist-credit';
  }
  
  // Handle plaza blocks with new quarter system
  if (parsedAddress.isPlaza) {
    // Handle new geographic plaza quarter format
    if (parsedAddress.isGeographicPlaza) {
      const geographicAddress = parsedAddress.geographicName;
      const matchingBlockId = getBlockIdFromGeographicName(geographicAddress);
      return matchingBlockId === blockId;
    }
    // Handle Center Camp
    if (parsedAddress.isCenterCamp) {
      if (blockId.startsWith('plaza_Center_Camp')) {
        if (blockId.includes('Quarter_')) {
          // Specific quarter match
          const blockMatch = blockId.match(/plaza_Center_Camp_Quarter_([A-D])/);
          if (!blockMatch) return false;
          
          const [_, blockQuarter] = blockMatch;
          return parsedAddress.quarter ? parsedAddress.quarter === blockQuarter : true;
        } else {
          // General Center Camp match (any quarter)
          return true;
        }
      }
      return false;
    }
    
    // Check if this is a plaza quarter block
    if (blockId.startsWith('plaza_')) {
      // For specific quarter matches like "plaza_3:00_B_Quarter_A"
      if (blockId.includes('Quarter_')) {
        // Parse the block ID to extract time, ring, and quarter
        const blockMatch = blockId.match(/plaza_(\d{1,2}:\d{2})_([BG])_Quarter_([A-D])/);
        if (!blockMatch) return false;
        
        const [_, blockTime, blockRing, blockQuarter] = blockMatch;
        const addressTime = `${parsedAddress.hour}:${parsedAddress.minute.toString().padStart(2, '0')}`;
        
        // Must match exact time, ring, and quarter if specified
        if (addressTime === blockTime && parsedAddress.ring === blockRing) {
          return parsedAddress.quarter ? parsedAddress.quarter === blockQuarter : true;
        }
        return false;
      }
      
      // For general plaza matches like "plaza_3:00_B" (any quarter)
      const blockMatch = blockId.match(/plaza_(\d{1,2}:\d{2})_([BG])/);
      if (blockMatch) {
        const [_, blockTime, blockRing] = blockMatch;
        const addressTime = `${parsedAddress.hour}:${parsedAddress.minute.toString().padStart(2, '0')}`;
        return addressTime === blockTime && parsedAddress.ring === blockRing;
      }
    }
    
    // Legacy plaza handling for older block IDs
    const isPlazaBlock = blockId.includes('Plaza') || blockId.includes('Center_Camp');
    if (!isPlazaBlock) return false;
    
    const addressTime = parsedAddress.hour + parsedAddress.minute / 60;
    const blockTimeParts = approximateTime.split(':');
    const blockTime = parseInt(blockTimeParts[0]) + parseInt(blockTimeParts[1]) / 60;
    
    return Math.abs(addressTime - blockTime) < 0.1;
  }
  
  // Check street match
  if (parsedAddress.street !== street) return false;
  
  // Check if time is within block range
  const campTime = parsedAddress.hour + parsedAddress.minute / 60;
  
  // Parse block time (handle both "2:00" and computed time formats)
  const blockTimeParts = approximateTime.split(':');
  const blockTime = parseInt(blockTimeParts[0]) + parseInt(blockTimeParts[1]) / 60;
  
  // Since addresses are now normalized to exact block times, require exact match (or very close)
  return Math.abs(campTime - blockTime) < 0.1;
};

// Plaza-specific gradient colors to simulate the actual gradient
const PLAZA_GRADIENT_COLORS = {
  // B plazas and Center Camp quarters - closer to center, lighter blue-gray
  'B_plaza': '#b5bfd8',
  'center_camp': '#b5bfd8',
  // G plazas - further from center, purple-gray
  'G_plaza': '#cec5db'
};

// Get plaza type from block ID
const getPlazaType = (blockId) => {
  if (blockId.includes('_B_Plaza') || blockId.includes('Center_Camp')) {
    return 'B_plaza';
  } else if (blockId.includes('_G_Plaza')) {
    return 'G_plaza';
  }
  return null;
};

// Get color for a block based on camps in it
export const getBlockColor = (blockId, camps, theme = '2024') => {
  const colors = THEMES[theme].colors;
  const campsInBlock = camps.filter(camp => 
    campInBlock(camp.placement_address, blockId)
  );
  
  // Check if this is a plaza element and handle gradient simulation
  const plazaType = getPlazaType(blockId);
  if (plazaType && campsInBlock.length === 0) {
    return PLAZA_GRADIENT_COLORS[plazaType];
  }
  
  if (campsInBlock.length === 0) return colors.none;
  
  // Use highest progress level
  const statuses = campsInBlock.map(c => c.bed_status);
  if (statuses.includes('bed_talk')) return colors.bed_talk;
  if (statuses.includes('consent_policy')) return colors.consent_policy;
  if (statuses.includes('registered')) return colors.registered;
  
  return colors.none;
};

// Helper function to get theme colors
export const getThemeColors = (theme = '2024') => {
  return THEMES[theme].colors;
};