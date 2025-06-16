import React, { useEffect, useState, useRef } from 'react';
import { useMapData } from '../hooks/useMapData';
import { getBlockColor, THEMES } from '../utils/blockUtils';
import InfoPanel from './InfoPanel';
import Legend from './Legend';
import ZoomControls from './ZoomControls';
import ThemeSwitcher from './ThemeSwitcher';
import CentralLogo from './CentralLogo';
import BackgroundOverlay from './BackgroundOverlay';
import ThinkHeader from './ThinkHeader';
import mapSvg from '/merged_map_full.svg';

const MapView = () => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const { camps, loading } = useMapData();
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [currentTheme, setCurrentTheme] = useState('2025');

  console.log('MapView rendering, loading:', loading, 'camps:', camps);

  useEffect(() => {
    console.log('MapView useEffect triggered');
    if (!svgRef.current || loading) {
      console.log('Early return - svgRef:', svgRef.current, 'loading:', loading);
      return;
    }

    const svgDoc = svgRef.current.contentDocument;
    console.log('SVG doc:', svgDoc);
    if (!svgDoc) return;

    // Color all blocks based on camp data
    const blocks = svgDoc.querySelectorAll('#Block_Overlays path');
    console.log('Found blocks:', blocks.length);
    blocks.forEach(block => {
      const color = getBlockColor(block.id, camps, currentTheme);
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
  }, [camps, loading, currentTheme]);

  // Zoom and pan functions
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom * 1.5, 5));
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom / 1.5, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    // Don't pan if clicking on UI elements or SVG content
    if (e.target.closest('.zoom-controls') || 
        e.target.closest('.info-panel') || 
        e.target.closest('.legend') ||
        e.target.closest('object') ||
        e.target.tagName === 'path' ||
        e.target.tagName === 'svg') {
      return;
    }
    setIsPanning(true);
    setLastPanPoint({ x: e.clientX, y: e.clientY });
    e.preventDefault();
    e.stopPropagation();
    // Prevent text selection
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const deltaX = e.clientX - lastPanPoint.x;
    const deltaY = e.clientY - lastPanPoint.y;
    
    setPan(prevPan => ({
      x: prevPan.x + deltaX,
      y: prevPan.y + deltaY
    }));
    
    setLastPanPoint({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    // Re-enable text selection
    document.body.style.userSelect = '';
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prevZoom => Math.max(0.5, Math.min(5, prevZoom * delta)));
  };

  // Add event listeners for pan and zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDownEvent = (e) => handleMouseDown(e);
    const handleMouseMoveEvent = (e) => handleMouseMove(e);
    const handleMouseUpEvent = () => handleMouseUp();
    const handleWheelEvent = (e) => handleWheel(e);

    container.addEventListener('mousedown', handleMouseDownEvent);
    document.addEventListener('mousemove', handleMouseMoveEvent);
    document.addEventListener('mouseup', handleMouseUpEvent);
    container.addEventListener('wheel', handleWheelEvent, { passive: false });

    return () => {
      container.removeEventListener('mousedown', handleMouseDownEvent);
      document.removeEventListener('mousemove', handleMouseMoveEvent);
      document.removeEventListener('mouseup', handleMouseUpEvent);
      container.removeEventListener('wheel', handleWheelEvent);
    };
  }, [isPanning, lastPanPoint]);

  const theme = THEMES[currentTheme];

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100vh', 
        background: theme.background,
        overflow: 'hidden',
        cursor: isPanning ? 'grabbing' : 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        transition: 'background 0.5s ease',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background overlay effects */}
      <BackgroundOverlay theme={currentTheme} />
      
      {/* THINK header for 2024 theme */}
      <ThinkHeader theme={currentTheme} />
      
      <h1 style={{ 
        position: 'absolute', 
        top: '1rem', 
        left: '1rem', 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        zIndex: 10,
        color: theme.textColor,
        textShadow: theme.isDark ? '2px 2px 4px rgba(0,0,0,0.5)' : '1px 1px 2px rgba(0,0,0,0.1)',
        transition: 'color 0.3s ease',
        fontFamily: theme.typography.headingFont
      }}>
        {currentTheme === '2024' ? 'B.E.D. Map' : 'Burning Man B.E.D. Map'}
      </h1>
      
      <p style={{ 
        position: 'absolute', 
        top: '4rem', 
        left: '1rem', 
        zIndex: 10,
        color: theme.textColor,
        fontSize: '0.875rem',
        opacity: 0.8,
        transition: 'color 0.3s ease',
        fontFamily: theme.typography.primaryFont
      }}>
        Loading: {loading ? 'Yes' : 'No'}, Camps: {camps.length}
      </p>
      
      <ThemeSwitcher 
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
      />
      
      <div className="zoom-controls">
        <ZoomControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          currentZoom={zoom}
        />
      </div>
      
      <div
        className="map-container"
        style={{
          width: '100%',
          height: '100%',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isPanning ? 'none' : 'transform 0.2s ease-out, opacity 0.3s ease',
          cursor: isPanning ? 'grabbing' : 'grab',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          opacity: loading ? 0.7 : 1
        }}
      >
        <object
          ref={svgRef}
          data={mapSvg}
          type="image/svg+xml"
          className="w-full h-full"
          onLoad={() => console.log('SVG loaded')}
        />
        
        {/* Central B.E.D. Logo - inside map container so it moves with zoom/pan */}
        <CentralLogo theme={currentTheme} />
      </div>
      
      <div className="legend">
        <Legend theme={currentTheme} />
      </div>
      
      {selectedBlock && (
        <div className="info-panel">
          <InfoPanel 
            blockId={selectedBlock} 
            camps={camps}
            theme={currentTheme}
            onClose={() => setSelectedBlock(null)}
          />
        </div>
      )}
    </div>
  );
};

export default MapView;