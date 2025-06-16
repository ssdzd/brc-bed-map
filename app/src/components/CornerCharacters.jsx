import React from 'react';
import { THEMES } from '../utils/blockUtils';

const CornerCharacters = ({ theme = '2025' }) => {
  const themeConfig = THEMES[theme];
  
  // Only show characters in 2024 theme to match original design
  if (theme !== '2024') {
    return null;
  }
  
  return (
    <>
      {/* Bottom Left Character - Pilot/Aviator */}
      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '2rem',
          zIndex: 15,
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF69B4 0%, #FF1493 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid #FFFFFF',
            boxShadow: '0 10px 30px rgba(255, 105, 180, 0.4)',
            animation: 'float 4s ease-in-out infinite',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Character Face */}
          <div style={{
            fontSize: '3rem',
            animation: 'bounce 2s ease-in-out infinite'
          }}>
            🥽
          </div>
          
          {/* Goggles reflection effect */}
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: '20%',
              width: '60%',
              height: '30%',
              background: 'linear-gradient(45deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
              borderRadius: '50%',
              animation: 'shimmer 3s ease-in-out infinite'
            }}
          />
        </div>
        
        {/* Character Info */}
        <div
          style={{
            marginTop: '1rem',
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
            padding: '0.5rem 1rem',
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{
            color: '#FFFFFF',
            fontSize: '0.8rem',
            fontFamily: themeConfig.typography.primaryFont,
            fontWeight: '600',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
          }}>
            🎪 Playa Explorer
          </div>
          <div style={{
            color: '#FFD700',
            fontSize: '0.7rem',
            fontFamily: themeConfig.typography.scriptFont,
            marginTop: '0.25rem'
          }}>
            "Ready for adventure!"
          </div>
        </div>
      </div>
      
      {/* Top Right Character - Festival-goer */}
      <div
        style={{
          position: 'absolute',
          top: '8rem',
          right: '2rem',
          zIndex: 15,
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF6B35 0%, #FFD60A 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid #FFFFFF',
            boxShadow: '0 8px 25px rgba(255, 107, 53, 0.4)',
            animation: 'float 3s ease-in-out infinite reverse',
            position: 'relative'
          }}
        >
          {/* Character Face */}
          <div style={{
            fontSize: '2.5rem',
            animation: 'wiggle 4s ease-in-out infinite'
          }}>
            🎭
          </div>
        </div>
        
        {/* Walking direction indicator */}
        <div
          style={{
            marginTop: '1rem',
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
            padding: '0.5rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{
            color: '#FFFFFF',
            fontSize: '0.7rem',
            fontFamily: themeConfig.typography.primaryFont,
            fontWeight: '500'
          }}>
            🚶‍♀️ Walking Zone
          </div>
        </div>
      </div>
      
      {/* Bottom Right - Action Labels */}
      <div
        style={{
          position: 'absolute',
          bottom: '8rem',
          right: '2rem',
          zIndex: 15,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'flex-end'
        }}
      >
        {/* Action Badge 1 */}
        <div
          style={{
            backgroundColor: '#FF6B35',
            color: '#FFFFFF',
            padding: '0.75rem 1.25rem',
            borderRadius: '2rem',
            border: '2px solid #FFFFFF',
            boxShadow: '0 6px 20px rgba(255, 107, 53, 0.3)',
            animation: 'slideInRight 0.8s ease-out 0.5s both',
            textAlign: 'center'
          }}
        >
          <div style={{
            fontSize: '1.2rem',
            marginBottom: '0.25rem'
          }}>
            🎬
          </div>
          <div style={{
            fontSize: '0.7rem',
            fontFamily: themeConfig.typography.displayFont,
            fontWeight: '600',
            letterSpacing: '0.05em'
          }}>
            REGISTERED MY CAMP AND STARTED
            <br />
            THE BEDUCATOR PROGRAM
          </div>
        </div>
        
        {/* Action Badge 2 */}
        <div
          style={{
            backgroundColor: '#AD1457',
            color: '#FFFFFF',
            padding: '0.75rem 1.25rem',
            borderRadius: '2rem',
            border: '2px solid #FFFFFF',
            boxShadow: '0 6px 20px rgba(173, 20, 87, 0.3)',
            animation: 'slideInRight 0.8s ease-out 1s both',
            textAlign: 'center'
          }}
        >
          <div style={{
            fontSize: '1.2rem',
            marginBottom: '0.25rem'
          }}>
            💝
          </div>
          <div style={{
            fontSize: '0.7rem',
            fontFamily: themeConfig.typography.displayFont,
            fontWeight: '600',
            letterSpacing: '0.05em'
          }}>
            CRAFTED OUR UNIQUE CONSENT POLICY
            <br />
            FOR OUR CAMP AND SENT IT OUT
          </div>
        </div>
        
        {/* Action Badge 3 */}
        <div
          style={{
            backgroundColor: '#FF1493',
            color: '#FFFFFF',
            padding: '0.75rem 1.25rem',
            borderRadius: '2rem',
            border: '2px solid #FFFFFF',
            boxShadow: '0 6px 20px rgba(255, 20, 147, 0.3)',
            animation: 'slideInRight 0.8s ease-out 1.5s both',
            textAlign: 'center'
          }}
        >
          <div style={{
            fontSize: '1.2rem',
            marginBottom: '0.25rem'
          }}>
            🎪
          </div>
          <div style={{
            fontSize: '0.7rem',
            fontFamily: themeConfig.typography.displayFont,
            fontWeight: '600',
            letterSpacing: '0.05em'
          }}>
            SCHEDULED OUR
            <br />
            BED TALK ON PLAYA
          </div>
        </div>
      </div>
      
      {/* Top Left - Website Reference */}
      <div
        style={{
          position: 'absolute',
          top: '12rem',
          left: '2rem',
          zIndex: 15,
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(0,0,0,0.4)',
            color: '#FFFFFF',
            padding: '1rem 1.5rem',
            borderRadius: '1rem',
            border: '2px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(15px)',
            textAlign: 'center',
            animation: 'fadeInUp 1s ease-out 2s both'
          }}
        >
          <div style={{
            fontSize: '1.5rem',
            marginBottom: '0.5rem'
          }}>
            🌐
          </div>
          <div style={{
            fontSize: '0.9rem',
            fontFamily: themeConfig.typography.displayFont,
            fontWeight: '700',
            letterSpacing: '0.1em',
            color: '#FFD700'
          }}>
            BEDtalks.org
          </div>
          <div style={{
            fontSize: '0.7rem',
            fontFamily: themeConfig.typography.primaryFont,
            marginTop: '0.25rem',
            opacity: 0.9
          }}>
            Bureau of Erotic Discourse
          </div>
        </div>
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        
        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default CornerCharacters;