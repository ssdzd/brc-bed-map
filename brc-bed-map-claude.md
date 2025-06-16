# BRC BED Map - Simplified Implementation

## Project Overview
Build an interactive Burning Man map that tracks BED (Burner Empowerment & Development) program progress. The map colors city blocks based on camp participation status and allows clicking blocks to see camp details.

## Key Simplification
We have a pre-made SVG (`merged_map_full.svg`) with polygon blocks already defined. Each block has an ID like `A_8`, `B_15`, etc. We just need to:
1. Load the SVG
2. Color blocks based on camp data
3. Handle click interactions
4. Connect to Airtable for camp data

## File Structure
```
src/
├── components/
│   ├── MapView.jsx         # Main map display
│   ├── InfoPanel.jsx       # Selected block details
│   └── Legend.jsx          # Color legend
├── hooks/
│   └── useMapData.js       # Airtable data fetching
├── utils/
│   └── blockUtils.js       # Block/camp matching logic
└── App.jsx                 # Main app
```

## Implementation Steps

### 1. Create MapView.jsx
```javascript
import React, { useEffect, useState, useRef } from 'react';
import { useMapData } from '../hooks/useMapData';
import { getBlockColor } from '../utils/blockUtils';
import InfoPanel from './InfoPanel';
import Legend from './Legend';

const MapView = () => {
  const svgRef = useRef(null);
  const { camps, loading } = useMapData();
  const [selectedBlock, setSelectedBlock] = useState(null);

  useEffect(() => {
    if (!svgRef.current || loading) return;

    const svgDoc = svgRef.current.contentDocument;
    if (!svgDoc) return;

    // Color all blocks based on camp data
    const blocks = svgDoc.querySelectorAll('#Block_Overlays path');
    blocks.forEach(block => {
      const color = getBlockColor(block.id, camps);
      block.style.fill = color;
      block.style.fillOpacity = '0.6';
      block.style.cursor = 'pointer';
      block.style.transition = 'all 0.2s';
      
      // Add hover effect
      block.onmouseenter = () => {
        block.style.fillOpacity = '0.8';
      };
      block.onmouseleave = () => {
        block.style.fillOpacity = '0.6';
      };
      
      // Add click handler
      block.onclick = () => {
        // Remove previous selection
        blocks.forEach(b => b.style.strokeWidth = '0.5');
        // Highlight selected
        block.style.strokeWidth = '3';
        block.style.stroke = '#1E40AF';
        setSelectedBlock(block.id);
      };
    });
  }, [camps, loading]);

  return (
    <div className="relative w-full h-screen bg-gray-100">
      <h1 className="absolute top-4 left-4 text-2xl font-bold z-10">
        Burning Man BED Map
      </h1>
      
      <object
        ref={svgRef}
        data="/merged_map_full.svg"
        type="image/svg+xml"
        className="w-full h-full"
        onLoad={() => console.log('SVG loaded')}
      />
      
      <Legend />
      
      {selectedBlock && (
        <InfoPanel 
          blockId={selectedBlock} 
          camps={camps}
          onClose={() => setSelectedBlock(null)}
        />
      )}
    </div>
  );
};

export default MapView;
```

### 2. Create blockUtils.js
```javascript
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
```

### 3. Create InfoPanel.jsx
```javascript
import React from 'react';
import { parseBlockId, campInBlock } from '../utils/blockUtils';

const InfoPanel = ({ blockId, camps, onClose }) => {
  const { street, approximateTime } = parseBlockId(blockId);
  const campsInBlock = camps.filter(camp => 
    campInBlock(camp.placement_address, blockId)
  );

  return (
    <div className="absolute top-4 right-4 bg-white p-6 rounded-lg shadow-xl max-w-sm z-20">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold">Block {blockId}</h3>
          <p className="text-sm text-gray-600">
            Street {street} near {approximateTime}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>
      
      {campsInBlock.length > 0 ? (
        <div>
          <p className="text-sm font-medium mb-2">
            {campsInBlock.length} camp{campsInBlock.length > 1 ? 's' : ''} in this block:
          </p>
          <ul className="space-y-2">
            {campsInBlock.map(camp => (
              <li key={camp.id} className="border-l-4 pl-3 py-1" 
                  style={{ borderColor: getBEDColor(camp.bed_status) }}>
                <div className="font-medium text-sm">{camp.camp_name}</div>
                <div className="text-xs text-gray-600">
                  {camp.placement_address} • {formatStatus(camp.bed_status)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No camps registered in this block</p>
      )}
    </div>
  );
};

const getBEDColor = (status) => {
  const colors = {
    none: '#9CA3AF',
    video_complete: '#FDE047',
    buddy_assigned: '#FB923C',
    fully_implemented: '#4ADE80'
  };
  return colors[status] || colors.none;
};

const formatStatus = (status) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default InfoPanel;
```

### 4. Create Legend.jsx
```javascript
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
```

### 5. Create useMapData.js (with mock data for now)
```javascript
import { useState, useEffect } from 'react';

// Mock data for Week 1 testing
const mockCamps = [
  { id: 1, camp_name: "Dusty Data", placement_address: "A & 3:00", bed_status: "video_complete" },
  { id: 2, camp_name: "Consent Camp", placement_address: "C & 4:30", bed_status: "buddy_assigned" },
  { id: 3, camp_name: "Starr's Oasis", placement_address: "E & 7:30", bed_status: "fully_implemented" },
  { id: 4, camp_name: "Tech Tent", placement_address: "B & 9:00", bed_status: "video_complete" },
  { id: 5, camp_name: "BED Headquarters", placement_address: "D & 6:00", bed_status: "fully_implemented" },
];

export const useMapData = () => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCamps(mockCamps);
      setLoading(false);
    }, 500);
  }, []);

  // Week 2: Replace with Airtable fetch
  // const fetchFromAirtable = async () => {
  //   const response = await fetch(AIRTABLE_URL, {
  //     headers: { 'Authorization': `Bearer ${AIRTABLE_PAT}` }
  //   });
  //   const data = await response.json();
  //   setCamps(data.records);
  // };

  return { camps, loading };
};
```

### 6. Update App.jsx
```javascript
import React from 'react';
import MapView from './components/MapView';
import './App.css';

function App() {
  return (
    <div className="App">
      <MapView />
    </div>
  );
}

export default App;
```

### 7. Add to public folder
- Copy `merged_map_full.svg` to `public/merged_map_full.svg`

### 8. Install dependencies
```bash
npm install
```

## Week 1 Success Criteria
- [ ] SVG loads and displays
- [ ] Blocks are colored based on mock data
- [ ] Clicking a block highlights it
- [ ] Info panel shows camp details
- [ ] Legend shows color meanings

## Week 2 Additions
- Connect to Airtable API
- Add camp creation/editing
- Implement real address parsing
- Add search functionality
- Export colored map as SVG

## Notes
- The SVG has blocks with IDs like `A_8`, `B_15` etc
- Each block represents a segment of a street
- Camp addresses are in format "C & 3:45"
- We're using rough approximations for block-to-camp matching in Week 1