import React from 'react';
import { THEMES } from '../utils/blockUtils';

const BEDmapHeader = ({ theme = '2024' }) => {
  const _themeConfig = THEMES[theme];
  
  // Show the BED map header for 2024 theme
  if (theme !== '2024') {
    return null;
  }
  
  return (
    <div
      className="bed-header-container"
      style={{
        position: 'absolute',
        top: '-13.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        zIndex: 30,
        pointerEvents: 'none'
      }}
    >
      {/* BED Map Header Image */}
      <img 
        src="/brc-bed-map/BED_Map.V1_Facebook_Post_Square_3.png"
        alt="BED Map"
        className="bed-header-image"
        style={{
          width: '700px',
          height: 'auto',
          objectFit: 'contain',
          filter: 'drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.6))',
          borderRadius: '8px'
        }}
      />
    </div>
  );
};

export default BEDmapHeader;