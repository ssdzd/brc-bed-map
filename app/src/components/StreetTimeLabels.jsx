import React from 'react';
import { THEMES } from '../utils/blockUtils';

const StreetTimeLabels = ({ theme = '2025', zoom = 1 }) => {
  const themeConfig = THEMES[theme];
  
  // Only show labels when zoomed in enough to be readable
  if (zoom < 1.5) return null;
  
  // Street labels (positioned around the rings)
  const streets = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  
  // Time labels (positioned around the clock)
  const timePositions = [
    { time: '12:00', angle: 0, x: 622, y: 100 },
    { time: '1:00', angle: 30, x: 720, y: 130 },
    { time: '2:00', angle: 60, x: 790, y: 200 },
    { time: '3:00', angle: 90, x: 820, y: 272 },
    { time: '4:00', angle: 120, x: 790, y: 344 },
    { time: '5:00', angle: 150, x: 720, y: 414 },
    { time: '6:00', angle: 180, x: 622, y: 444 },
    { time: '7:00', angle: 210, x: 524, y: 414 },
    { time: '8:00', angle: 240, x: 454, y: 344 },
    { time: '9:00', angle: 270, x: 424, y: 272 },
    { time: '10:00', angle: 300, x: 454, y: 200 },
    { time: '11:00', angle: 330, x: 524, y: 130 }
  ];
  
  // Street ring positions (approximate radii from center)
  const streetPositions = [
    { street: 'A', radius: 80, visible: zoom > 2 },
    { street: 'B', radius: 100, visible: zoom > 1.8 },
    { street: 'C', radius: 120, visible: zoom > 1.6 },
    { street: 'D', radius: 140, visible: true },
    { street: 'E', radius: 160, visible: true },
    { street: 'F', radius: 180, visible: true },
    { street: 'G', radius: 200, visible: true },
    { street: 'H', radius: 220, visible: true },
    { street: 'I', radius: 240, visible: true },
    { street: 'J', radius: 260, visible: true }
  ];
  
  const centerX = 622; // The Man's X coordinate
  const centerY = 272; // The Man's Y coordinate
  
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 5
      }}
    >
      {/* Time Labels */}
      {timePositions.map(pos => (
        <div
          key={pos.time}
          style={{
            position: 'absolute',
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${Math.max(0.7, zoom * 0.4)}rem`,
            fontWeight: '700',
            fontFamily: themeConfig.typography.displayFont,
            color: theme === '2024' ? '#FFFFFF' : '#374151',
            textShadow: theme === '2024' 
              ? '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(255,105,180,0.5)'
              : '1px 1px 2px rgba(255,255,255,0.8)',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.375rem',
            backgroundColor: theme === '2024' 
              ? 'rgba(255,105,180,0.3)'
              : 'rgba(255,255,255,0.7)',
            border: `1px solid ${theme === '2024' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.1)'}`,
            backdropFilter: 'blur(5px)',
            transition: 'all 0.3s ease',
            opacity: Math.min(1, (zoom - 1.5) / 0.5)
          }}
        >
          {pos.time}
        </div>
      ))}
      
      {/* Street Labels */}
      {streetPositions.map(street => {
        if (!street.visible) return null;
        
        // Position street labels at 6 o'clock position on each ring
        const x = centerX;
        const y = centerY + street.radius + 15;
        
        return (
          <div
            key={street.street}
            style={{
              position: 'absolute',
              left: `${x}px`,
              top: `${y}px`,
              transform: 'translate(-50%, -50%)',
              fontSize: `${Math.max(0.8, zoom * 0.5)}rem`,
              fontWeight: '800',
              fontFamily: themeConfig.typography.displayFont,
              color: theme === '2024' ? '#FFD700' : '#1E40AF',
              textShadow: theme === '2024' 
                ? '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(255,212,0,0.5)'
                : '1px 1px 2px rgba(255,255,255,0.8)',
              padding: '0.375rem 0.75rem',
              borderRadius: '0.5rem',
              backgroundColor: theme === '2024' 
                ? 'rgba(255,212,0,0.2)'
                : 'rgba(30,64,175,0.1)',
              border: `2px solid ${theme === '2024' ? '#FFD700' : '#1E40AF'}`,
              backdropFilter: 'blur(5px)',
              transition: 'all 0.3s ease',
              opacity: Math.min(1, (zoom - 1.3) / 0.5),
              letterSpacing: '0.1em'
            }}
          >
            {street.street}
          </div>
        );
      })}
      
      {/* Esplanade Label */}
      {zoom > 1.8 && (
        <div
          style={{
            position: 'absolute',
            left: `${centerX}px`,
            top: `${centerY + 60}px`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${Math.max(0.9, zoom * 0.6)}rem`,
            fontWeight: '800',
            fontFamily: themeConfig.typography.scriptFont,
            color: theme === '2024' ? '#FF69B4' : '#7C3AED',
            textShadow: theme === '2024' 
              ? '2px 2px 4px rgba(0,0,0,0.8), 0 0 12px rgba(255,105,180,0.6)'
              : '2px 2px 4px rgba(255,255,255,0.8)',
            padding: '0.5rem 1rem',
            borderRadius: '1rem',
            backgroundColor: theme === '2024' 
              ? 'rgba(255,105,180,0.2)'
              : 'rgba(124,58,237,0.1)',
            border: `2px solid ${theme === '2024' ? '#FF69B4' : '#7C3AED'}`,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            opacity: Math.min(1, (zoom - 1.8) / 0.3),
            letterSpacing: '0.05em'
          }}
        >
          🛤️ Esplanade
        </div>
      )}
      
      {/* Center Camp Label */}
      {zoom > 2 && (
        <div
          style={{
            position: 'absolute',
            left: `${centerX}px`,
            top: `${centerY - 40}px`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${Math.max(0.7, zoom * 0.4)}rem`,
            fontWeight: '600',
            fontFamily: themeConfig.typography.primaryFont,
            color: theme === '2024' ? '#FFFFFF' : '#059669',
            textShadow: theme === '2024' 
              ? '1px 1px 2px rgba(0,0,0,0.8)'
              : '1px 1px 2px rgba(255,255,255,0.8)',
            padding: '0.375rem 0.75rem',
            borderRadius: '0.5rem',
            backgroundColor: theme === '2024' 
              ? 'rgba(0,0,0,0.3)'
              : 'rgba(5,150,105,0.1)',
            border: `1px solid ${theme === '2024' ? 'rgba(255,255,255,0.3)' : '#059669'}`,
            backdropFilter: 'blur(5px)',
            transition: 'all 0.3s ease',
            opacity: Math.min(1, (zoom - 2) / 0.5)
          }}
        >
          🏕️ Center Camp
        </div>
      )}
    </div>
  );
};

export default StreetTimeLabels;