import React from 'react';
import { THEMES } from '../utils/blockUtils';
import logoImage from '../assets/logo@4x.png';
import fullnameImage from '../assets/fullname@4x.png';

const CentralLogo = ({ theme = '2025' }) => {
  const themeConfig = THEMES[theme];
  
  return (
    <div
      style={{
        position: 'absolute',
        top: '66%',
        left: '53%',
        transform: 'translate(-50%, -50%)',
        width: '400px',
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
        transition: 'all 0.5s ease'
      }}
    >
      {/* Main B.E.D. Logo Image */}
      <img 
        src={logoImage}
        alt="B.E.D. Logo"
        style={{
          width: '80%',
          height: 'auto',
          objectFit: 'contain',
          marginBottom: '0.5rem',
          transform: 'translateX(-5px)',
          filter: theme === '2024' 
          ? 'drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5))'
          : 'drop-shadow(0px 0px 0px rgba(0, 0, 0, 0.3))'
        }}
      />
      {/*
      {/* Full Name Image */}
      {/*<img 
        src={fullnameImage}
        alt="Bureau of Erotic Discourse"
        style={{
          width: '90%',
          height: 'auto',
          objectFit: 'contain',
          marginBottom: '0.5rem',
          filter: theme === '2024' 
            ? 'drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5))'
            : 'drop-shadow(0px 0px 0px rgba(0, 0, 0, 0.3))'
        }}
      >*/}
      {/* BEDtalks.org Text */}
      <div
        style={{
          fontSize: '2rem',
          marginTop: '40rem',
          fontWeight: '600',
          fontFamily: themeConfig.typography.primaryFont,
          color: themeConfig.textColor,
          opacity: 0.8,
          textAlign: 'center',
          letterSpacing: '0.1em',
          filter: theme === '2024' 
            ? 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))'
            : 'drop-shadow(0px 0px 0px rgba(0, 0, 0, 0.3))'
        }}
      >
        BEDtalks.org
      </div>
      
      {/* Decorative elements for 2024 theme */}
      {theme === '2024' && (
        <>
          {/* Top sparkle */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '20px',
              width: '6px',
              height: '6px',
              background: '#FFD700',
              borderRadius: '50%',
              boxShadow: '0 0 10px #FFD700',
              animation: 'pulse 2s infinite'
            }}
          />
          
          {/* Bottom sparkle */}
          <div
            style={{
              position: 'absolute',
              bottom: '15px',
              left: '25px',
              width: '4px',
              height: '4px',
              background: '#FF6B35',
              borderRadius: '50%',
              boxShadow: '0 0 8px #FF6B35',
              animation: 'pulse 2.5s infinite'
            }}
          />
        </>
      )}
      
      {/* Ring decoration for professional theme */}
      {theme === '2025' && (
        <div
          style={{
            position: 'absolute',
            inset: '-10px',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            opacity: 0.5
          }}
        />
      )}
      
      {/* Add CSS keyframes for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes glow {
          0% { 
            box-shadow: 0 0 30px rgba(255, 105, 180, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2);
          }
          100% { 
            box-shadow: 0 0 50px rgba(255, 105, 180, 0.8), inset 0 0 30px rgba(255, 255, 255, 0.3);
          }
        }
      `}</style>
    </div>
  );
};

export default CentralLogo;