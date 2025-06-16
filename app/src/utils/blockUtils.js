// BED status colors - 2025 Theme (Clean/Professional)
export const BED_COLORS_2025 = {
  none: '#9CA3AF',           // Gray
  video_complete: '#FDE047',  // Yellow
  buddy_assigned: '#FB923C',  // Orange
  fully_implemented: '#4ADE80' // Green
};

// BED status colors - 2024 Theme (Vibrant/Fun)
export const BED_COLORS_2024 = {
  none: '#F8F9FA',              // Light gray/white
  video_complete: '#FFD60A',    // Bright yellow
  buddy_assigned: '#FF6B35',    // Orange  
  fully_implemented: '#FF1493'  // Hot pink
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
  '2024': {
    name: '2024 Vibrant',
    colors: BED_COLORS_2024,
    background: 'radial-gradient(ellipse at top, #FF69B4 0%, #FF1493 25%, #E91E63 50%, #C2185B 75%, #AD1457 100%)',
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
  }
};

// Parse block ID like "A_8" into components
export const parseBlockId = (blockId) => {
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
  
  // Parse camp address like "C & 3:45"
  const match = campAddress.match(/([A-K])\s*&\s*(\d{1,2}):(\d{2})/);
  if (!match) return false;
  
  const [_, campStreet, campHour, campMinute] = match;
  
  // Check street match
  if (campStreet !== street) return false;
  
  // Check if time is within block range (rough approximation)
  const campTime = parseInt(campHour) + parseInt(campMinute) / 60;
  const blockTime = parseInt(approximateTime.split(':')[0]) + 
                    parseInt(approximateTime.split(':')[1]) / 60;
  
  // Within 15 minutes
  return Math.abs(campTime - blockTime) < 0.25;
};

// Get color for a block based on camps in it
export const getBlockColor = (blockId, camps, theme = '2025') => {
  const colors = THEMES[theme].colors;
  const campsInBlock = camps.filter(camp => 
    campInBlock(camp.placement_address, blockId)
  );
  
  if (campsInBlock.length === 0) return colors.none;
  
  // Use highest progress level
  const statuses = campsInBlock.map(c => c.bed_status);
  if (statuses.includes('fully_implemented')) return colors.fully_implemented;
  if (statuses.includes('buddy_assigned')) return colors.buddy_assigned;
  if (statuses.includes('video_complete')) return colors.video_complete;
  
  return colors.none;
};

// Helper function to get theme colors
export const getThemeColors = (theme = '2025') => {
  return THEMES[theme].colors;
};