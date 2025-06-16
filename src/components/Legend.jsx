import React from 'react';
import { BED_COLORS } from '../utils/blockUtils';

const Legend = () => {
  const items = [
    { status: 'none', label: 'No Engagement' },
    { status: 'video_complete', label: 'Video Complete' },
    { status: 'buddy_assigned', label: 'Buddy Assigned' },
    { status: 'fully_implemented', label: 'Fully Implemented' }
  ];

  return (
    <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg">
      <h4 className="font-bold text-sm mb-2">BED Progress</h4>
      <div className="space-y-1">
        {items.map(item => (
          <div key={item.status} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: BED_COLORS[item.status] }}
            />
            <span className="text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend; 