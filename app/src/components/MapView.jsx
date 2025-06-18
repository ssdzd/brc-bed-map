import React, { useEffect, useState, useRef } from 'react';
import { useMapData } from '../hooks/useMapData';
import { getBlockColor, THEMES, campInBlock } from '../utils/blockUtils';
import InfoPanel from './InfoPanel';
import Legend from './Legend';
import ZoomControls from './ZoomControls';
import ThemeSwitcher from './ThemeSwitcher';
import CentralLogo from './CentralLogo';
import BackgroundOverlay from './BackgroundOverlay';
import BEDmapHeader from './BEDmapHeader';
import Tooltip from './Tooltip';
import CornerCharacters from './CornerCharacters';
import CompassRose from './CompassRose';
import SearchPanel from './SearchPanel';
import StreetTimeLabels from './StreetTimeLabels';
import StatsPanel from './StatsPanel';
import SharePanel from './SharePanel';
import { useUrlState } from '../hooks/useUrlState';
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
  const [tooltip, setTooltip] = useState({ visible: false, content: null, position: { x: 0, y: 0 } });
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const { urlState, updateUrl, copyToClipboard } = useUrlState();

  console.log('MapView rendering, loading:', loading, 'camps:', camps);

  // Initialize state from URL on mount (only once)
  const [initializedFromUrl, setInitializedFromUrl] = useState(false);
  
  useEffect(() => {
    if (!initializedFromUrl) {
      setCurrentTheme(urlState.theme);
      setZoom(urlState.zoom);
      setPan(urlState.pan);
      if (urlState.selectedBlock) setSelectedBlock(urlState.selectedBlock);
      setInitializedFromUrl(true);
    }
  }, [urlState, initializedFromUrl]);

  // Update URL when key state changes (only after initialization)
  useEffect(() => {
    if (initializedFromUrl) {
      const newState = {
        theme: currentTheme,
        zoom,
        pan,
        selectedBlock,
        search: '' // Could be connected to search state if needed
      };
      updateUrl(newState);
    }
  }, [currentTheme, zoom, pan, selectedBlock, updateUrl, initializedFromUrl]);

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
      const campsInBlock = camps.filter(camp => 
        campInBlock(camp.placement_address, block.id)
      );
      
      block.style.fill = color;
      block.style.fillOpacity = '0.6';
      block.style.cursor = 'pointer';
      block.style.transition = 'all 0.3s ease';
      block.style.stroke = currentTheme === '2024' ? '#FFFFFF' : '#374151';
      block.style.strokeWidth = '0.5';
      
      // Enhanced hover effect with tooltip
      block.onmouseenter = (e) => {
        block.style.fillOpacity = '0.9';
        block.style.strokeWidth = '2';
        block.style.filter = 'brightness(1.1)';
        setHoveredBlock(block.id);
        
        // Show tooltip
        const rect = svgRef.current.getBoundingClientRect();
        const tooltipContent = {
          title: `Block ${block.id}`,
          description: campsInBlock.length > 0 
            ? `${campsInBlock.length} camp${campsInBlock.length > 1 ? 's' : ''} registered`
            : 'No camps registered',
          camps: campsInBlock
        };
        
        setTooltip({
          visible: true,
          content: tooltipContent,
          position: {
            x: e.clientX - rect.left + rect.left,
            y: e.clientY - rect.top + rect.top - 10
          }
        });
      };
      
      block.onmouseleave = () => {
        if (selectedBlock !== block.id) {
          block.style.fillOpacity = '0.6';
          block.style.strokeWidth = '0.5';
          block.style.filter = 'none';
        }
        setHoveredBlock(null);
        setTooltip({ visible: false, content: null, position: { x: 0, y: 0 } });
      };
      
      // Enhanced click handler with animation
      block.onclick = (e) => {
        e.stopPropagation();
        
        // Remove previous selection
        blocks.forEach(b => {
          if (b.id !== block.id) {
            const blockColor = getBlockColor(b.id, camps, currentTheme);
            b.style.fill = blockColor;
            b.style.fillOpacity = '0.6';
            b.style.strokeWidth = '0.5';
            b.style.stroke = currentTheme === '2024' ? '#FFFFFF' : '#374151';
            b.style.filter = 'none';
          }
        });
        
        // Highlight selected with enhanced styling
        block.style.strokeWidth = '4';
        block.style.stroke = currentTheme === '2024' ? '#FFD700' : '#3B82F6';
        block.style.fillOpacity = '0.9';
        block.style.filter = 'brightness(1.2) drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))';
        
        // Add pulse animation
        block.style.animation = 'blockPulse 0.6s ease-out';
        setTimeout(() => {
          block.style.animation = '';
        }, 600);
        
        setSelectedBlock(block.id);
        setTooltip({ visible: false, content: null, position: { x: 0, y: 0 } });
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

  const handleCampSelect = (camp) => {
    setSelectedCamp(camp);
    setSearchVisible(false);
    
    // Find the block this camp is in and select it
    const blockId = `${camp.placement_address.split(' ')[0]}_${camp.placement_address.split(' ')[2]}`;
    setSelectedBlock(blockId);
  };
  
  const handleFilterChange = (filterData) => {
    // Could be used to highlight filtered camps on the map
    console.log('Filter changed:', filterData);
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
      
      {/* BED map header for 2024 theme */}
      <BEDmapHeader theme={currentTheme} />
      
      {/* Search Panel */}
      <SearchPanel
        camps={camps}
        theme={currentTheme}
        onCampSelect={handleCampSelect}
        onFilterChange={handleFilterChange}
        isVisible={searchVisible}
        onToggle={() => setSearchVisible(!searchVisible)}
      />
      
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
      
      {/* Compass Rose */}
      <CompassRose theme={currentTheme} zoom={zoom} />
      
      {/* Stats Panel */}
      <StatsPanel
        camps={camps}
        theme={currentTheme}
        isVisible={statsVisible}
        onToggle={() => setStatsVisible(!statsVisible)}
      />
      
      {/* Share Panel */}
      <SharePanel
        theme={currentTheme}
        isVisible={shareVisible}
        onToggle={() => setShareVisible(!shareVisible)}
        onCopyUrl={copyToClipboard}
        currentState={{
          theme: currentTheme,
          zoom,
          pan,
          selectedBlock,
          search: '' // Could be connected to search state
        }}
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
        
        {/* Street and Time Labels - inside map container so they move with zoom/pan */}
        <StreetTimeLabels theme={currentTheme} zoom={zoom} />
        
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
      
      {/* Tooltip */}
      <Tooltip
        theme={currentTheme}
        content={tooltip.content}
        position={tooltip.position}
        visible={tooltip.visible}
      />
      
      {/* Corner Characters - only shown in 2024 theme */}
      <CornerCharacters theme={currentTheme} />
      
      {/* CSS Animations */}
      <style>{`
        @keyframes blockPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default MapView;