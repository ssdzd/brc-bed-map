// BED status colors
export const BED_COLORS = {
  none: '#9CA3AF',           // Gray
  video_complete: '#FDE047',  // Yellow
  buddy_assigned: '#FB923C',  // Orange
  fully_implemented: '#4ADE80' // Green
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
export const getBlockColor = (blockId, camps) => {
  const campsInBlock = camps.filter(camp => 
    campInBlock(camp.placement_address, blockId)
  );
  
  if (campsInBlock.length === 0) return BED_COLORS.none;
  
  // Use highest progress level
  const statuses = campsInBlock.map(c => c.bed_status);
  if (statuses.includes('fully_implemented')) return BED_COLORS.fully_implemented;
  if (statuses.includes('buddy_assigned')) return BED_COLORS.buddy_assigned;
  if (statuses.includes('video_complete')) return BED_COLORS.video_complete;
  
  return BED_COLORS.none;
}; 