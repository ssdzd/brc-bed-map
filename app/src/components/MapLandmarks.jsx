import React from 'react';
import { PlayaIcons } from './PlayaIcons';
import { THEMES } from '../utils/blockUtils';

const MapLandmarks = ({ theme = '2025', onLandmarkClick }) => {
  const themeConfig = THEMES[theme];
  
  // Calculate positions based on SVG coordinate system
  // The Man is at approximately (622.5, 272.04) in the SVG
  // SVG viewBox is "0 0 1160.17 861.54"
  
  // Convert BRC coordinates to SVG positions
  const getPosition = (street, time) => {
    const manX = 622.5;
    const manY = 272.04;
    
    // Rough calculation for positioning (this would need fine-tuning)
    const timeAngle = ((time - 6) * 30 - 90) * (Math.PI / 180); // 6:00 = bottom, convert to radians
    
    let radius;
    if (street === 'Esplanade') {
      radius = 120; // Distance from center for Esplanade
    } else {
      // For plaza positions, use smaller radius
      radius = 80;
    }
    
    const x = manX + radius * Math.cos(timeAngle);
    const y = manY + radius * Math.sin(timeAngle);
    
    return { x, y };
  };
  
  // Define landmark positions
  const landmarks = [
    {
      id: 'medical-esplanade',
      name: 'Medical - Esplanade',
      icon: PlayaIcons.RedCross,
      position: getPosition('Esplanade', 5.25), // 5:15
      address: 'Esplanade & 5:15'
    },
    {
      id: 'medical-3-plaza',
      name: 'Medical - 3:00 Plaza',
      icon: PlayaIcons.RedCross,
      position: getPosition('Plaza', 3), // Behind 3:00 plaza
      address: '3:00 Plaza'
    },
    {
      id: 'medical-9-plaza',
      name: 'Medical - 9:00 Plaza',
      icon: PlayaIcons.RedCross,
      position: getPosition('Plaza', 9), // Behind 9:00 plaza
      address: '9:00 Plaza'
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
              left: `${(landmark.position.x / 1160.17) * 100}%`,
              top: `${(landmark.position.y / 861.54) * 100}%`,
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