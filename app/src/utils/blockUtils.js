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


// Default to 2025 theme for backward compatibility
export const BED_COLORS = BED_COLORS_2025;

// Theme configurations
export const THEMES = {
  '2025': {
    name: '2025 Professional',
    colors: BED_COLORS_2025,
    background: '#ffffff',
    containerBg: '#f3f4f6',
    textColor: '#374151',
    isDark: false,
    centerCircle: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
      border: '2px solid #e2e8f0',
      textColor: '#1e293b'
    },
    typography: {
      primaryFont: 'Inter, system-ui, sans-serif',
      headingFont: 'Inter, system-ui, sans-serif',
      scriptFont: 'Dancing Script, cursive',
      displayFont: 'Bebas Neue, sans-serif'
    }
  },
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

// Convert block ID back to display format (handles both street blocks and plaza quarters)
export const blockIdToDisplayAddress = (blockId) => {
  // Handle plaza quarter block IDs like "plaza_3:00_B_Quarter_A"
  if (blockId.startsWith('plaza_')) {
    // Handle Center Camp quarters
    const centerCampMatch = blockId.match(/^plaza_Center_Camp(?:_Quarter_([A-D]))?$/);
    if (centerCampMatch) {
      const quarter = centerCampMatch[1];
      return quarter ? `Center Camp Quarter ${quarter}` : 'Center Camp';
    }
    
    // Handle regular plaza quarters
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
  
  // Handle regular street addresses like "3:45 & C" or "3:45 & Esplanade" (new format)
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
  
  // Also handle old format for backward compatibility "C & 3:45"
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

// Check if a camp address matches a block
export const campInBlock = (campAddress, blockId) => {
  const { street, approximateTime } = parseBlockId(blockId);
  const parsedAddress = parseAddress(campAddress);
  
  if (!parsedAddress) return false;
  
  // Handle plaza blocks with new quarter system
  if (parsedAddress.isPlaza) {
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
  '2025': {
    // B plazas and Center Camp quarters - higher contrast for 2025 theme
    'B_plaza': '#9bb2d8',
    'center_camp': '#9bb2d8', 
    // G plazas - stronger purple-gray for better contrast
    'G_plaza': '#c4b5db'
  },
  '2024': {
    // Original colors for 2024 theme
    'B_plaza': '#b5bfd8',
    'center_camp': '#b5bfd8',
    'G_plaza': '#cec5db'
  }
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
export const getBlockColor = (blockId, camps, theme = '2025') => {
  const colors = THEMES[theme].colors;
  const campsInBlock = camps.filter(camp => 
    campInBlock(camp.placement_address, blockId)
  );
  
  // Check if this is a plaza element and handle gradient simulation
  const plazaType = getPlazaType(blockId);
  if (plazaType && campsInBlock.length === 0) {
    const themeColors = PLAZA_GRADIENT_COLORS[theme] || PLAZA_GRADIENT_COLORS['2024'];
    return themeColors[plazaType] || PLAZA_GRADIENT_COLORS['2024'][plazaType];
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
export const getThemeColors = (theme = '2025') => {
  return THEMES[theme].colors;
};