import React, { useEffect, useState, useRef } from 'react';
import { useMapData } from '../hooks/useMapData';
import { getBlockColor, THEMES, campInBlock } from '../utils/blockUtils';
import InfoPanel from './InfoPanel';
import Legend from './Legend';
import ZoomControls from './ZoomControls';
import ThemeSwitcher from './ThemeSwitcher';
import DataSourceSelector from './DataSourceSelector';
import CentralLogo from './CentralLogo';
import BackgroundOverlay from './BackgroundOverlay';
import BEDmapHeader from './BEDmapHeader';
import Tooltip from './Tooltip';
import CornerCharacters from './CornerCharacters';
import SearchPanel from './SearchPanel';
import StatsPanel from './StatsPanel';
import SharePanel from './SharePanel';
import { useUrlState } from '../hooks/useUrlState';
import mapSvg from '/brc_combined_validation.svg';

const MapView = () => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dataSource, setDataSource] = useState('airtable');
  const { camps, loading, error, mockDataStats, refresh } = useMapData(dataSource);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [zoom, setZoom] = useState(0.67);
  const [pan, setPan] = useState({ x: -32, y: 84 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [currentTheme, setCurrentTheme] = useState('2024');
  const [tooltip, setTooltip] = useState({ visible: false, content: null, position: { x: 0, y: 0 } });
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [searchVisible, setSearchVisible] = useState(false);
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

    // Update gradient references based on current theme
    const gradientId = currentTheme.includes('2024') ? 'cityGradient-2024' : 'cityGradient-2025';
    console.log('Using gradient ID:', gradientId, 'for theme:', currentTheme);

    // Color all blocks and plaza quarters based on camp data - BED colors override gradient
    const blocks = svgDoc.querySelectorAll('#BRC_Polygons_Overlay path, .plaza-quarter');
    console.log('Found blocks and plaza-quarters:', blocks.length);
    blocks.forEach(block => {
      const color = getBlockColor(block.id, camps, currentTheme);
      const campsInBlock = camps.filter(camp => 
        campInBlock(camp.placement_address, block.id)
      );
      
      // Use BED status color as fill if present, otherwise use gradient
      if (color !== THEMES[currentTheme].colors.none) {
        // BED status override - use solid color fill
        block.style.setProperty('fill', color, 'important');
        const fillOpacity = '0.7';
        block.style.setProperty('fill-opacity', fillOpacity, 'important');
        console.log(`Block ${block.id} - BED status color:`, color);
      } else {
        // No BED status - show gradient with full opacity
        const gradientFill = `url(#${gradientId})`;
        block.style.setProperty('fill', gradientFill, 'important');
        block.style.setProperty('fill-opacity', '1.0', 'important');
        console.log(`Block ${block.id} - Using gradient:`, gradientFill);
        
        // Gradient should now be visible
      }
      
      block.style.setProperty('cursor', 'pointer', 'important');
      block.style.setProperty('transition', 'all 0.3s ease', 'important');
      
      // Remove stroke borders for clean look
      block.style.setProperty('stroke', 'none', 'important');
      block.style.setProperty('stroke-width', '0', 'important');
      
      // Enhanced hover effect with tooltip
      block.onmouseenter = (e) => {
        const hoverOpacity = '1.0';
        block.style.setProperty('fill-opacity', hoverOpacity, 'important');
        
        block.style.setProperty('filter', 'brightness(1.1)', 'important');
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
          // Restore normal opacity based on BED status
          if (color !== THEMES[currentTheme].colors.none) {
            block.style.setProperty('fill-opacity', '0.7', 'important');
          } else {
            block.style.setProperty('fill-opacity', '1.0', 'important');
          }
          
          block.style.setProperty('filter', 'none', 'important');
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
            
            // Restore normal fill and opacity for unselected blocks
            if (blockColor !== THEMES[currentTheme].colors.none) {
              b.style.setProperty('fill', blockColor, 'important');
              b.style.setProperty('fill-opacity', '0.7', 'important');
            } else {
              b.style.setProperty('fill', `url(#${gradientId})`, 'important');
              b.style.setProperty('fill-opacity', '1.0', 'important');
            }
            b.style.setProperty('filter', 'none', 'important');
          }
        });
        
        // Highlight selected with enhanced styling
        block.style.setProperty('fill-opacity', '1.0', 'important');
        block.style.setProperty('filter', 'brightness(1.2) drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))', 'important');
        
        // Add pulse animation
        block.style.setProperty('animation', 'blockPulse 0.6s ease-out', 'important');
        setTimeout(() => {
          block.style.setProperty('animation', '', 'important');
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
    setSearchVisible(false);
    
    // Find the block this camp is in and select it
    const blockId = `${camp.placement_address.split(' ')[0]}_${camp.placement_address.split(' ')[2]}`;
    setSelectedBlock(blockId);
  };
  
  const handleFilterChange = (filterData) => {
    // Could be used to highlight filtered camps on the map
    console.log('Filter changed:', filterData);
  };

  const handleDataSourceChange = (newSource) => {
    setDataSource(newSource);
    console.log('Data source changed to:', newSource);
  };

  const handleMouseDown = (e) => {
    // Pan disabled
    return;
  };

  const handleMouseMove = (e) => {
    // Pan disabled
    return;
  };

  const handleMouseUp = () => {
    // Pan disabled
    return;
  };

  const handleWheel = (e) => {
    // Zoom disabled
    return;
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
    <>
      
      <div 
        ref={containerRef}
        style={{ 
          position: 'relative', 
          width: '100%', 
          height: '100vh', 
          background: theme.background,
          overflow: 'hidden',
          cursor: 'default',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          transition: 'background 0.5s ease',
          backgroundAttachment: 'fixed',
          zIndex: 15 // Above the background
        }}
      >
        {/* Background overlay */}
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
        zIndex: 40,
        color: theme.textColor,
        textShadow: theme.isDark 
            ? '2px 2px 4px rgba(0,0,0,0.5)' 
            : '1px 1px 2px rgba(0,0,0,0.1)',
        transition: 'color 0.3s ease',
        fontFamily: theme.typography.headingFont
      }}>
        {currentTheme === '2024' ? 'B.E.D. Map' : 'Burning Man B.E.D. Map'}
      </h1>
      
      <p style={{ 
        position: 'absolute', 
        top: '4rem', 
        left: '1rem', 
        zIndex: 40,
        color: theme.textColor,
        fontSize: '0.875rem',
        opacity: 0.8,
        transition: 'color 0.3s ease',
        fontFamily: theme.typography.primaryFont,
        textShadow: 'none'
      }}>
        Loading: {loading ? 'Yes' : 'No'}, Camps: {camps.length}
        {error && <span style={{ color: '#ef4444', marginLeft: '1rem' }}>({error})</span>}
        {dataSource === 'mock' && <span style={{ color: '#10b981', marginLeft: '1rem' }}>(Mock Data)</span>}
      </p>
      
      <ThemeSwitcher 
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
      />
      
      {/* Data Source Selector */}
      <DataSourceSelector
        currentSource={dataSource}
        onSourceChange={handleDataSourceChange}
        theme={currentTheme}
        mockDataStats={mockDataStats}
      />
      
      
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
      
      {/* Zoom controls hidden */}
      {false && (
        <div className="zoom-controls">
          <ZoomControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
            currentZoom={zoom}
          />
        </div>
      )}
      
      <div
        className="map-container"
        style={{
          width: '100%',
          height: '100%',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isPanning ? 'none' : 'transform 0.2s ease-out, opacity 0.3s ease',
          cursor: 'default',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          opacity: loading ? 0.7 : 1,
          zIndex: 20 // Ensure map is above background
        }}
      >
        
        <object
          ref={svgRef}
          data={mapSvg}
          type="image/svg+xml"
          className="w-full h-full"
          style={{ 
            zIndex: 25,
            filter: 'none'
          }}
          onLoad={() => {
            console.log('SVG loaded');
            console.log('SVG contentDocument:', svgRef.current?.contentDocument);
          }}
        />
        
        
        {/* Central B.E.D. Logo - positioned at The Man */}
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
      
      {/* CSS Animations and SVG element hiding */}
      <style>{`
        @keyframes blockPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        /* Hide The Man and Temple from the SVG */
        #The_Man {
          display: none !important;
        }
        
        #Temple {
          display: none !important;
        }
      `}</style>
    </div>
    </>
  );
};

export default MapView;