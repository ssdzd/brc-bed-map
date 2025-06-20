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

// Official Map BED colors (semi-transparent overlays)
export const BED_COLORS_OFFICIAL_2025 = {
  none: 'transparent',                    // Completely transparent
  registered: 'rgba(254, 136, 3, 0.4)',   // Orange with 40% opacity
  consent_policy: 'rgba(152, 7, 171, 0.4)', // Purple with 40% opacity  
  bed_talk: 'rgba(255, 20, 147, 0.5)'     // Hot pink with 50% opacity
};

export const BED_COLORS_OFFICIAL_2024 = {
  none: 'transparent',                     // Completely transparent
  registered: 'rgba(254, 136, 3, 0.5)',    // Orange with 50% opacity
  consent_policy: 'rgba(152, 7, 171, 0.5)', // Purple with 50% opacity
  bed_talk: 'rgba(255, 20, 147, 0.6)'      // Hot pink with 60% opacity
};

// Default to 2025 theme for backward compatibility
export const BED_COLORS = BED_COLORS_2025;

// Theme configurations
export const THEMES = {
  '2025': {
    name: '2025 Professional',
    colors: BED_COLORS_2025,
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 30%, #e2e8f0 70%, #cbd5e1 100%)',
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
  '2025-official': {
    name: '2025 Official Map',
    colors: BED_COLORS_OFFICIAL_2025,
    background: 'transparent', // Uses OfficialMapBackground component
    containerBg: 'transparent',
    textColor: '#1e293b',
    isDark: false,
    isOfficial: true,
    centerCircle: {
      background: 'transparent',
      border: 'none',
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
  '2024-official': {
    name: '2024 Official Map',
    colors: BED_COLORS_OFFICIAL_2024,
    background: 'transparent', // Uses OfficialMapBackground component
    containerBg: 'transparent',
    textColor: '#FFFFFF',
    isDark: true,
    isOfficial: true,
    centerCircle: {
      background: 'transparent',
      border: 'none',
      textColor: '#FFFFFF'
    },
    typography: {
      primaryFont: 'Inter, system-ui, sans-serif',
      headingFont: 'Bebas Neue, sans-serif',
      scriptFont: 'Pacifico, cursive',
      displayFont: 'Bebas Neue, sans-serif'
    }
  }
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

// Check if a camp address matches a block
export const campInBlock = (campAddress, blockId) => {
  const { street, approximateTime } = parseBlockId(blockId);
  
  // Parse camp address like "C & 3:45" or "Esplanade & 3:45"
  const match = campAddress.match(/(Esplanade|[A-K])\s*&\s*(\d{1,2}):(\d{2})/);
  if (!match) return false;
  
  const [_, campStreet, campHour, campMinute] = match;
  
  // Check street match
  if (campStreet !== street) return false;
  
  // Check if time is within block range (rough approximation)
  const campTime = parseInt(campHour) + parseInt(campMinute) / 60;
  
  // Parse block time (handle both "2:00" and computed time formats)
  const blockTimeParts = approximateTime.split(':');
  const blockTime = parseInt(blockTimeParts[0]) + parseInt(blockTimeParts[1]) / 60;
  
  // Within 30 minutes (wider range for new polygon format)
  return Math.abs(campTime - blockTime) < 0.5;
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
export const getBlockColor = (blockId, camps, theme = '2025') => {
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
export const getThemeColors = (theme = '2025') => {
  return THEMES[theme].colors;
};