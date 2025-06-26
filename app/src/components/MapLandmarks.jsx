import React from 'react';
import { PlayaIcons } from './PlayaIcons';
import { THEMES } from '../utils/blockUtils';

const MapLandmarks = ({ theme = '2025', onLandmarkClick }) => {
  const themeConfig = THEMES[theme];
  
  // SVG coordinate system
  const SVG_WIDTH = 1160.17;
  const SVG_HEIGHT = 861.54;
  const MAN_X = 622.5;
  const MAN_Y = 272.04;
  
  // Convert BRC coordinates to SVG positions
  const getPosition = (street, time) => {
    // Rough calculation for positioning (this would need fine-tuning)
    const timeAngle = ((time - 6) * 30 - 90) * (Math.PI / 180); // 6:00 = bottom, convert to radians
    
    let radius;
    if (street === 'Esplanade') {
      radius = 120; // Distance from center for Esplanade
    } else if (street === 'D') {
      radius = 140; // Distance from center for D street (from StreetTimeLabels.jsx)
    } else {
      // For plaza positions, use smaller radius
      radius = 80;
    }
    
    const x = MAN_X + radius * Math.cos(timeAngle);
    const y = MAN_Y + radius * Math.sin(timeAngle);
    
    return { x, y };
  };
  
  // Calculate exact coordinates for D & 3:00 and D & 9:00
  const d3Position = getPosition('D', 3); // D & 3:00
  const d9Position = getPosition('D', 9); // D & 9:00
  
  // Extract center point from polygon_B_3:00 path coordinates
  // Path: M 916.5,272.0 A 294.0,294.0 0 0,1 906.6,348.2 L 932.9,355.2 A 321.0,321.0 0 0,0 943.5,272.0 Z
  // Key points: (916.5,272.0), (906.6,348.2), (932.9,355.2), (943.5,272.0)
  // Calculate center point of the bounding box
  const polygonB3Center = {
    x: (916.5 + 906.6 + 932.9 + 943.5) / 4, // Average of x coordinates
    y: (272.0 + 348.2 + 355.2 + 272.0) / 4   // Average of y coordinates
  };
  
  // C street intersection coordinates calculated by calculate_intersections.py
  const c3Position = { x: 622.50, y: 392.04 }; // C & 3:00
  const c9Position = { x: 622.50, y: 152.04 }; // C & 9:00
  
  // Define landmark positions with proper address validation
  const landmarks = [
    {
      id: 'medical-esplanade',
      name: 'Medical - Esplanade',
      icon: PlayaIcons.RedCross,
      position: getPosition('Esplanade', 5.25), // 5:15
      address: 'Esplanade & 5:15'
    },
    {
      id: 'medical-9-plaza',
      name: 'Medical - 9:00 Plaza',
      icon: PlayaIcons.RedCross,
      // Position at exact C & 9:00 intersection
      position: c9Position,
      address: 'C & 9:00'
    },
    {
      id: 'ranger-hq',
      name: 'Ranger HQ',
      icon: PlayaIcons.RangerHQ,
      position: getPosition('Esplanade', 5.75), // 5:45
      address: 'Esplanade & 5:45'
    }
  ];
  
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 30 }}>
      {landmarks.map(landmark => {
        const IconComponent = landmark.icon;
        return (
          <div
            key={landmark.id}
            style={{
              position: 'absolute',
              left: `${(landmark.position.x / SVG_WIDTH) * 100}%`,
              top: `${(landmark.position.y / SVG_HEIGHT) * 100}%`,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto',
              cursor: 'pointer',
              zIndex: 35,
              padding: '0.5rem',
              borderRadius: '50%',
              backgroundColor: landmark.id.includes('medical') 
                ? 'rgba(220, 38, 127, 0.9)' // Red background for medical
                : landmark.id === 'ranger-hq'
                ? 'rgba(59, 130, 246, 0.9)' // Blue background for ranger
                : 'rgba(99, 102, 241, 0.9)', // Purple background for airport
              boxShadow: themeConfig.isDark 
                ? '0 4px 12px rgba(0, 0, 0, 0.4), 0 0 8px rgba(255, 255, 255, 0.2)'
                : '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 8px rgba(255, 255, 255, 0.8)',
              transition: 'all 0.3s ease'
            }}
            title={`${landmark.name} - ${landmark.address}`}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translate(-50%, -50%) scale(1.2)';
              e.target.style.boxShadow = themeConfig.isDark 
                ? '0 6px 16px rgba(0, 0, 0, 0.5), 0 0 12px rgba(255, 255, 255, 0.3)'
                : '0 6px 16px rgba(0, 0, 0, 0.4), 0 0 12px rgba(255, 255, 255, 1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translate(-50%, -50%) scale(1)';
              e.target.style.boxShadow = themeConfig.isDark 
                ? '0 4px 12px rgba(0, 0, 0, 0.4), 0 0 8px rgba(255, 255, 255, 0.2)'
                : '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 8px rgba(255, 255, 255, 0.8)';
            }}
          >
            <IconComponent size="1.5rem" color="white" />
          </div>
        );
      })}
    </div>
  );
};

export default MapLandmarks;