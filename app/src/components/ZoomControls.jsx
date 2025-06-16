import React from 'react';

const ZoomControls = ({ onZoomIn, onZoomOut, onResetZoom, currentZoom }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      zIndex: 15,
      backgroundColor: 'white',
      padding: '0.5rem',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <button
        onClick={onZoomIn}
        style={{
          width: '40px',
          height: '40px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: 'white',
          cursor: 'pointer',
          fontSize: '18px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Zoom In"
      >
        +
      </button>
      
      <button
        onClick={onZoomOut}
        style={{
          width: '40px',
          height: '40px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: 'white',
          cursor: 'pointer',
          fontSize: '18px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Zoom Out"
      >
        −
      </button>
      
      <button
        onClick={onResetZoom}
        style={{
          width: '40px',
          height: '40px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: 'white',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Reset Zoom"
      >
        ⌂
      </button>
      
      <div style={{
        fontSize: '12px',
        textAlign: 'center',
        color: '#666',
        padding: '0.25rem'
      }}>
        {Math.round(currentZoom * 100)}%
      </div>
    </div>
  );
};

export default ZoomControls;