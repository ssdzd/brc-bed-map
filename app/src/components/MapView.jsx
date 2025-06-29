import React, { useEffect, useState, useRef } from 'react';
import { useMapData } from '../hooks/useMapData';
import { getBlockColor, THEMES, campInBlock, blockIdToDisplayAddress } from '../utils/blockUtils';
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
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
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
  const [showCoordinates, setShowCoordinates] = useState(false);
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
      
      // Check if this block is currently selected
      const isSelected = selectedBlock === block.id;
      
      // Use BED status color as fill if present, otherwise use gradient
      if (color !== THEMES[currentTheme].colors.none) {
        // BED status override - use solid color fill
        block.style.setProperty('fill', color, 'important');
        const fillOpacity = isSelected ? '1.0' : '0.7';
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
      
      // Apply selection styling if this block is selected
      if (isSelected) {
        // Apply white glow selection styling
        block.style.setProperty('stroke', '#FFFFFF', 'important');
        block.style.setProperty('stroke-width', '6', 'important');
        block.style.setProperty('stroke-opacity', '1.0', 'important');
        block.style.setProperty('stroke-dasharray', 'none', 'important');
        block.style.setProperty('stroke-linejoin', 'round', 'important');
        block.style.setProperty('stroke-linecap', 'round', 'important');
        
        // Multiple layered glow effects for maximum visibility
        const glowFilter = [
          'brightness(1.3)',
          'drop-shadow(0 0 20px rgba(255, 255, 255, 1.0))',
          'drop-shadow(0 0 10px rgba(255, 255, 255, 0.9))',
          'drop-shadow(0 0 5px rgba(255, 255, 255, 0.8))',
          'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))'
        ].join(' ');
        block.style.setProperty('filter', glowFilter, 'important');
        console.log(`Applied selection styling to block ${block.id}`);
      } else {
        // Remove stroke borders for clean look (but preserve plaza-quarter strokes)
        if (!block.classList.contains('plaza-quarter')) {
          block.style.setProperty('stroke', 'none', 'important');
          block.style.setProperty('stroke-width', '0', 'important');
        }
        block.style.setProperty('filter', 'none', 'important');
      }
      
      // Enhanced hover effect with tooltip
      block.onmouseenter = (e) => {
        // Only apply hover effects if block is not already selected
        if (selectedBlock !== block.id) {
          const hoverOpacity = '1.0';
          block.style.setProperty('fill-opacity', hoverOpacity, 'important');
          
          block.style.setProperty('filter', 'brightness(1.1)', 'important');
        }
        setHoveredBlock(block.id);
        
        // Show tooltip with display address
        const rect = svgRef.current.getBoundingClientRect();
        const displayAddress = blockIdToDisplayAddress(block.id);
        
        // Calculate SVG coordinates if enabled
        let coordinates = null;
        if (showCoordinates) {
          // Get the bounding box of the block to find its center
          const bbox = block.getBBox();
          const centerX = bbox.x + bbox.width / 2;
          const centerY = bbox.y + bbox.height / 2;
          coordinates = `(${centerX.toFixed(1)}, ${centerY.toFixed(1)})`;
        }
        
        const tooltipContent = {
          title: displayAddress,
          description: campsInBlock.length > 0 
            ? `${campsInBlock.length} camp${campsInBlock.length > 1 ? 's' : ''} registered`
            : 'No camps registered',
          camps: campsInBlock,
          coordinates: coordinates
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
          // Remove selection stroke if not selected
          block.style.setProperty('stroke', 'none', 'important');
          block.style.setProperty('stroke-width', '0', 'important');
        } else {
          // If this block is selected, maintain the white glow selection styling
          block.style.setProperty('fill-opacity', '1.0', 'important');
          block.style.setProperty('stroke', '#FFFFFF', 'important');
          block.style.setProperty('stroke-width', '6', 'important');
          block.style.setProperty('stroke-opacity', '1.0', 'important');
          const glowFilter = [
            'brightness(1.3)',
            'drop-shadow(0 0 20px rgba(255, 255, 255, 1.0))',
            'drop-shadow(0 0 10px rgba(255, 255, 255, 0.9))',
            'drop-shadow(0 0 5px rgba(255, 255, 255, 0.8))',
            'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))'
          ].join(' ');
          block.style.setProperty('filter', glowFilter, 'important');
        }
        setHoveredBlock(null);
        setTooltip({ visible: false, content: null, position: { x: 0, y: 0 } });
      };
      
      // Enhanced click handler with animation
      block.onclick = (e) => {
        e.stopPropagation();
        
        // Safety check and capture current values
        if (!camps || !Array.isArray(camps)) {
          console.warn('Camps data not available for click handler');
          setSelectedBlock(block.id);
          setTooltip({ visible: false, content: null, position: { x: 0, y: 0 } });
          return;
        }
        
        const currentCamps = camps;
        const currentThemeValue = currentTheme;
        const currentGradientId = gradientId;
        
        // Selection styling is now handled by the main useEffect when selectedBlock changes
        
        // Add pulse animation
        block.style.setProperty('animation', 'blockPulse 0.6s ease-out', 'important');
        setTimeout(() => {
          block.style.setProperty('animation', '', 'important');
        }, 600);
        
        setSelectedBlock(block.id);
        setTooltip({ visible: false, content: null, position: { x: 0, y: 0 } });
        
        // Close all toolbars when clicking on a new camp
        setSearchVisible(false);
        setStatsVisible(false);
        setShareVisible(false);
      };
    });

    // Remove any special SVG styling since we only use 2024 theme
    const joinedBorders = svgDoc.querySelector('#Joined_Borders');
    if (joinedBorders) {
      joinedBorders.style.setProperty('filter', 'none', 'important');
    }
    
    // Add medical icon directly to SVG at coordinates (943, 271)
    const existingIcon = svgDoc.querySelector('#medical-icon-3c');
    if (!existingIcon) {
      // Create a group for the medical icon
      const iconGroup = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
      iconGroup.setAttribute('id', 'medical-icon-3c');
      iconGroup.setAttribute('transform', 'translate(943, 271)');
      
      // Create a circle background for the icon
      const background = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'circle');
      background.setAttribute('cx', '0');
      background.setAttribute('cy', '0');
      background.setAttribute('r', '12');
      background.setAttribute('fill', 'rgba(220, 38, 127, 0.9)');
      background.setAttribute('stroke', 'white');
      background.setAttribute('stroke-width', '2');
      background.setAttribute('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');
      
      // Create the medical cross symbol
      const cross = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
      cross.setAttribute('fill', 'white');
      
      // Vertical line of the cross
      const verticalLine = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
      verticalLine.setAttribute('x', '-1.5');
      verticalLine.setAttribute('y', '-6');
      verticalLine.setAttribute('width', '3');
      verticalLine.setAttribute('height', '12');
      verticalLine.setAttribute('rx', '1.5');
      
      // Horizontal line of the cross
      const horizontalLine = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
      horizontalLine.setAttribute('x', '-6');
      horizontalLine.setAttribute('y', '-1.5');
      horizontalLine.setAttribute('width', '12');
      horizontalLine.setAttribute('height', '3');
      horizontalLine.setAttribute('rx', '1.5');
      
      // Add lines to cross group
      cross.appendChild(verticalLine);
      cross.appendChild(horizontalLine);
      
      // Add background and cross to icon group
      iconGroup.appendChild(background);
      iconGroup.appendChild(cross);
      
      // Add tooltip title
      const title = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = 'Medical - 3:00 Plaza - C & 3:00';
      iconGroup.appendChild(title);
      
      // Add the icon group to the SVG
      svgDoc.documentElement.appendChild(iconGroup);
      
      console.log('Medical icon added to SVG at (943, 271)');
    }

    // Add medical icon directly to SVG at coordinates (301, 271) for 9:00 & C plaza
    const existingIcon9c = svgDoc.querySelector('#medical-icon-9c');
    if (!existingIcon9c) {
      // Create a group for the medical icon
      const iconGroup = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
      iconGroup.setAttribute('id', 'medical-icon-9c');
      iconGroup.setAttribute('transform', 'translate(301, 271)');
      
      // Create a circle background for the icon
      const background = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'circle');
      background.setAttribute('cx', '0');
      background.setAttribute('cy', '0');
      background.setAttribute('r', '12');
      background.setAttribute('fill', 'rgba(220, 38, 127, 0.9)');
      background.setAttribute('stroke', 'white');
      background.setAttribute('stroke-width', '2');
      background.setAttribute('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');
      
      // Create the medical cross symbol
      const cross = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
      cross.setAttribute('fill', 'white');
      
      // Vertical line of the cross
      const verticalLine = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
      verticalLine.setAttribute('x', '-1.5');
      verticalLine.setAttribute('y', '-6');
      verticalLine.setAttribute('width', '3');
      verticalLine.setAttribute('height', '12');
      verticalLine.setAttribute('rx', '1.5');
      
      // Horizontal line of the cross
      const horizontalLine = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
      horizontalLine.setAttribute('x', '-6');
      horizontalLine.setAttribute('y', '-1.5');
      horizontalLine.setAttribute('width', '12');
      horizontalLine.setAttribute('height', '3');
      horizontalLine.setAttribute('rx', '1.5');
      
      // Add lines to cross group
      cross.appendChild(verticalLine);
      cross.appendChild(horizontalLine);
      
      // Add background and cross to icon group
      iconGroup.appendChild(background);
      iconGroup.appendChild(cross);
      
      // Add tooltip title
      const title = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = 'Medical - 9:00 Plaza - C & 9:00';
      iconGroup.appendChild(title);
      
      // Add the icon group to the SVG
      svgDoc.documentElement.appendChild(iconGroup);
      
      console.log('Medical icon added to SVG at (301, 271) for 9:00 & C plaza');
    }

    // Add medical icon directly to SVG at coordinates (712, 487) for 5:15 & Esplanade
    const existingIcon515 = svgDoc.querySelector('#medical-icon-515');
    if (!existingIcon515) {
      // Create a group for the medical icon
      const iconGroup = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
      iconGroup.setAttribute('id', 'medical-icon-515');
      iconGroup.setAttribute('transform', 'translate(712, 487)');
      
      // Create a circle background for the icon
      const background = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'circle');
      background.setAttribute('cx', '0');
      background.setAttribute('cy', '0');
      background.setAttribute('r', '12');
      background.setAttribute('fill', 'rgba(220, 38, 127, 0.9)');
      background.setAttribute('stroke', 'white');
      background.setAttribute('stroke-width', '2');
      background.setAttribute('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');
      
      // Create the medical cross symbol
      const cross = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
      cross.setAttribute('fill', 'white');
      
      // Vertical line of the cross
      const verticalLine = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
      verticalLine.setAttribute('x', '-1.5');
      verticalLine.setAttribute('y', '-6');
      verticalLine.setAttribute('width', '3');
      verticalLine.setAttribute('height', '12');
      verticalLine.setAttribute('rx', '1.5');
      
      // Horizontal line of the cross
      const horizontalLine = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'rect');
      horizontalLine.setAttribute('x', '-6');
      horizontalLine.setAttribute('y', '-1.5');
      horizontalLine.setAttribute('width', '12');
      horizontalLine.setAttribute('height', '3');
      horizontalLine.setAttribute('rx', '1.5');
      
      // Add lines to cross group
      cross.appendChild(verticalLine);
      cross.appendChild(horizontalLine);
      
      // Add background and cross to icon group
      iconGroup.appendChild(background);
      iconGroup.appendChild(cross);
      
      // Add tooltip title
      const title = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = 'Medical - 5:15 & Esplanade';
      iconGroup.appendChild(title);
      
      // Add the icon group to the SVG
      svgDoc.documentElement.appendChild(iconGroup);
      
      console.log('Medical icon added to SVG at (712, 487) for 5:15 & Esplanade');
    }

    // Add Ranger HQ icon at 5:45 & Esplanade
    const rangerIcon = document.createElementNS("http://www.w3.org/2000/svg", "g");
    rangerIcon.setAttribute("id", "ranger-hq-icon");
    rangerIcon.setAttribute("transform", "translate(565, 495)");
    
    // Green circle background
    const rangerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    rangerCircle.setAttribute("cx", "0");
    rangerCircle.setAttribute("cy", "0");
    rangerCircle.setAttribute("r", "24");
    rangerCircle.setAttribute("fill", "#c3b091");
    rangerCircle.setAttribute("stroke", "#166534");
    rangerCircle.setAttribute("stroke-width", "2");
    
    // Ranger SVG image
    const rangerImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
    rangerImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/Ranger.svg");
    rangerImage.setAttribute("href", "/Ranger.svg"); // Fallback for modern browsers
    rangerImage.setAttribute("x", "-21");
    rangerImage.setAttribute("y", "-21");
    rangerImage.setAttribute("width", "42");
    rangerImage.setAttribute("height", "42");
    rangerImage.setAttribute("preserveAspectRatio", "xMidYMid meet");
    
    // Tooltip
    const rangerTitle = document.createElementNS("http://www.w3.org/2000/svg", "title");
    rangerTitle.textContent = "Ranger HQ";
    
    rangerIcon.appendChild(rangerCircle);
    rangerIcon.appendChild(rangerImage);
    rangerIcon.appendChild(rangerTitle);
    
    svgDoc.documentElement.appendChild(rangerIcon);
    console.log("Added Ranger HQ icon at coordinates: 565, 495");
  }, [camps, loading, currentTheme, selectedBlock]);

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
    
    // Find the block this camp is in by checking all blocks
    if (!svgRef.current?.contentDocument) return;
    
    const svgDoc = svgRef.current.contentDocument;
    const blocks = svgDoc.querySelectorAll('#BRC_Polygons_Overlay path, .plaza-quarter');
    
    // Find the block that contains this camp
    let foundBlockId = null;
    blocks.forEach(block => {
      if (campInBlock(camp.placement_address, block.id)) {
        foundBlockId = block.id;
      }
    });
    
    if (foundBlockId) {
      setSelectedBlock(foundBlockId);
      console.log(`Selected block ${foundBlockId} for camp ${camp.camp_name} at ${camp.placement_address}`);
    } else {
      console.warn(`Could not find block for camp ${camp.camp_name} at ${camp.placement_address}`);
    }
  };
  
  const handleFilterChange = (filterData) => {
    console.log('Filter changed:', filterData);
    
    // If a specific status filter is selected, highlight all matching blocks
    if (filterData.statusFilter !== 'all' && filterData.filteredCamps.length > 0) {
      // Find all unique block IDs that contain camps with the filtered status
      const blocksToHighlight = new Set();
      
      if (svgRef.current?.contentDocument) {
        const svgDoc = svgRef.current.contentDocument;
        const blocks = svgDoc.querySelectorAll('#BRC_Polygons_Overlay path, .plaza-quarter');
        
        filterData.filteredCamps.forEach(camp => {
          blocks.forEach(block => {
            if (campInBlock(camp.placement_address, block.id)) {
              blocksToHighlight.add(block.id);
            }
          });
        });
        
        // If only one block matches, select it
        if (blocksToHighlight.size === 1) {
          const blockId = Array.from(blocksToHighlight)[0];
          setSelectedBlock(blockId);
        }
      }
    }
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
        
        {/* Loading State */}
        {loading && (
          <LoadingSpinner 
            theme={currentTheme} 
            message={dataSource === 'mock' ? 'Generating mock data...' : 'Loading camp data...'}
          />
        )}
        
        {/* Error State */}
        {error && !loading && (
          <ErrorDisplay
            theme={currentTheme}
            error={error}
            onRetry={refresh}
            title="Failed to load camp data"
            showDetails={false}
          />
        )}
      
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
      
      {/* Title hidden for cleaner look */}
      {false && (
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
              : '0px 2px 4px rgba(0,0,0,0.2), 0px 0px 8px rgba(0,0,0,0.1)',
          transition: 'color 0.3s ease',
          fontFamily: theme.typography.headingFont
        }}>
          {currentTheme === '2024' ? 'B.E.D. Map' : 'Burning Man B.E.D. Map'}
        </h1>
      )}
      
      {/* Status indicator hidden - use debug mode */}
      {false && !loading && !error && (
        <p style={{ 
          position: 'absolute', 
          top: '4rem', 
          left: '1rem', 
          zIndex: 40,
          color: theme.textColor,
          fontSize: '0.875rem',
          opacity: 0.7,
          transition: 'color 0.3s ease',
          fontFamily: theme.typography.primaryFont,
          textShadow: 'none'
        }}>
          {camps.length} camps loaded
          {dataSource === 'mock' && <span style={{ color: '#10b981', marginLeft: '0.5rem' }}>(Mock Data)</span>}
        </p>
      )}
      
      {/* Theme switcher hidden - using 2024 Vibrant as default */}
      {false && (
        <ThemeSwitcher 
          currentTheme={currentTheme}
          onThemeChange={setCurrentTheme}
        />
      )}
      
      {/* Coordinate Toggle - hidden */}
      {false && (
        <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '20rem',
          zIndex: 50,
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          padding: '2px',
          borderRadius: '4px'
        }}
      >
        <button
          onClick={() => {
            const newState = !showCoordinates;
            setShowCoordinates(newState);
            console.log('Coordinate toggle clicked, new state:', newState);
          }}
          style={{
            backgroundColor: showCoordinates 
              ? (theme.isDark ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.9)')
              : (theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
            color: showCoordinates 
              ? '#ffffff' 
              : theme.textColor,
            border: `1px solid ${showCoordinates 
              ? 'rgba(59, 130, 246, 0.5)' 
              : (theme.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')}`,
            borderRadius: '0.5rem',
            padding: '0.5rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: '500',
            fontFamily: theme.typography.primaryFont,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            boxShadow: theme.isDark 
              ? '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 8px rgba(255, 255, 255, 0.1)'
              : '0 4px 12px rgba(0, 0, 0, 0.1), 0 0 8px rgba(255, 255, 255, 0.8)',
            textShadow: showCoordinates ? 'none' : '1px 1px 2px rgba(0,0,0,0.1)',
            minWidth: '120px'
          }}
          title="Toggle SVG coordinates in tooltips"
        >
          {showCoordinates ? '📍 Coords ON' : '📍 Coords OFF'}
        </button>
      </div>
      )}
      
      {/* Alternative Coordinate Toggle - hidden */}
      {false && (
        <div
        style={{
          position: 'absolute',
          top: '6rem', // Below the camps loaded text
          left: '1rem',
          zIndex: 50,
          backgroundColor: 'rgba(0, 255, 0, 0.1)', // Temporary debug background (green)
          padding: '2px',
          borderRadius: '4px'
        }}
      >
        <button
          onClick={() => {
            const newState = !showCoordinates;
            setShowCoordinates(newState);
            console.log('Alternative coordinate toggle clicked, new state:', newState);
          }}
          style={{
            backgroundColor: showCoordinates 
              ? (theme.isDark ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.9)')
              : (theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
            color: showCoordinates 
              ? '#ffffff' 
              : theme.textColor,
            border: `1px solid ${showCoordinates 
              ? 'rgba(59, 130, 246, 0.5)' 
              : (theme.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')}`,
            borderRadius: '0.5rem',
            padding: '0.5rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: '500',
            fontFamily: theme.typography.primaryFont,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            boxShadow: theme.isDark 
              ? '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 8px rgba(255, 255, 255, 0.1)'
              : '0 4px 12px rgba(0, 0, 0, 0.1), 0 0 8px rgba(255, 255, 255, 0.8)',
            textShadow: showCoordinates ? 'none' : '1px 1px 2px rgba(0,0,0,0.1)',
            minWidth: '120px'
          }}
          title="Toggle SVG coordinates in tooltips (Alternative)"
        >
          {showCoordinates ? '📍 Coords ON' : '📍 Coords OFF'}
        </button>
      </div>
      )}
      
      {/* Data Source Selector hidden - use debug mode */}
      {false && (
        <DataSourceSelector
          currentSource={dataSource}
          onSourceChange={handleDataSourceChange}
          theme={currentTheme}
          mockDataStats={mockDataStats}
        />
      )}
      
      
      {/* Stats Panel */}
      <StatsPanel
        camps={camps}
        theme={currentTheme}
        isVisible={statsVisible}
        onToggle={() => {
          setStatsVisible(!statsVisible);
          // Close InfoPanel when stats opens due to overlap
          if (!statsVisible) {
            setSelectedBlock(null);
          }
        }}
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
            loading={loading}
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