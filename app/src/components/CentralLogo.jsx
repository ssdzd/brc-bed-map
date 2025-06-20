import React from 'react';
import { THEMES } from '../utils/blockUtils';
import logoImage from '../assets/logo@4x.png';
import fullnameImage from '../assets/fullname@4x.png';

const CentralLogo = ({ theme = '2025' }) => {
  const themeConfig = THEMES[theme] || THEMES['2025'];
  
  // SVG coordinate system from brc_combined_validation.svg
  const SVG_WIDTH = 1160.17;
  const SVG_HEIGHT = 861.54;
  
  // The Man's coordinates from the SVG
  const MAN_X = 622.5;
  const MAN_Y = 272.04;
  
  // Convert SVG coordinates to percentage for positioning
  const manLeftPercent = (MAN_X / SVG_WIDTH) * 100;
  const manTopPercent = (MAN_Y / SVG_HEIGHT) * 100;
  
  // BEDtalks.org position (below K ring, between 5:30 and 6:30)
  // Approximate coordinates for this location
  const BEDTALKS_X = 622.5; // Same horizontal as The Man
  const BEDTALKS_Y = 850; // Much further below the K ring
  const bedtalksLeftPercent = (BEDTALKS_X / SVG_WIDTH) * 100;
  const bedtalksTopPercent = (BEDTALKS_Y / SVG_HEIGHT) * 100;
  
  return (
    <>
      {/* Main B.E.D. Logo at The Man's position using SVG coordinates */}
      <div
        style={{
          position: 'absolute',
          top: `${manTopPercent}%`,
          left: `${manLeftPercent}%`,
          transform: 'translate(-50%, -50%)',
          marginLeft: '-25px',
          width: '360px',
          height: '360px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 30,
          transition: 'all 0.5s ease'
        }}
      >
        {/* Main B.E.D. Logo Image */}
        <img 
          src={logoImage}
          alt="B.E.D. Logo"
          style={{
            width: '100%',
            height: 'auto',
            objectFit: 'contain',
            filter: theme === '2024' 
                ? 'drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5))'
                : 'drop-shadow(0px 0px 0px rgba(0, 0, 0, 0.3))'
          }}
        />
      </div>

      {/* BEDtalks.org Text - positioned below K ring using SVG coordinates */}
      <div
        style={{
          position: 'absolute',
          top: `${bedtalksTopPercent}%`,
          left: `${bedtalksLeftPercent}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 30,
          fontSize: '1.2rem',
          fontWeight: '600',
          fontFamily: themeConfig.typography.primaryFont,
          color: themeConfig.textColor,
          opacity: 0.9,
          textAlign: 'center',
          letterSpacing: '0.1em',
          textShadow: theme === '2024' 
              ? '2px 2px 4px rgba(0, 0, 0, 0.5)'
              : '0px 0px 0px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.5s ease'
        }}
      >
        BEDtalks.org
      </div>
    </>
  );
};

export default CentralLogo;