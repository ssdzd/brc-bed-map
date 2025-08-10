import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useMapData } from '../hooks/useMapData';
import { getBlockColor, THEMES, campInBlock, blockIdToDisplayAddress, simplifyPlazaName, shouldAddSectorSuffix } from '../utils/blockUtils';
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
import UpdatePanel from './UpdatePanel';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import PerformanceDashboard from './PerformanceDashboard';
import { useUrlState } from '../hooks/useUrlState';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { logger } from '../utils/logger';
import mapSvg from '/brc_combined_validation.svg';

/**
 * Main MapView Component - Interactive BED Map for Black Rock City
 * 
 * This is the primary component that renders the interactive map showing
 * Bureau of Erotic Discourse (BED) program progress across theme camps.
 * 
 * Features:
 * - Interactive SVG map with zoom/pan controls
 * - Block coloring based on BED participation status
 * - Real-time data from Airtable with mock data fallback
 * - Theme switching (2024 Vibrant / 2025 Professional)
 * - URL state persistence for sharing
 * - Mobile-responsive design
 * - Performance monitoring in development
 * 
 * @component
 * @returns {JSX.Element} The complete interactive map interface
 */
const MapView = () => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dataSource, setDataSource] = useState('airtable');
  const { camps, loading, error, mockDataStats, refresh } = useMapData(dataSource);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 0, y: 84 });
  const [_isPanning, _setIsPanning] = useState(false);
  const [_lastPanPoint, _setLastPanPoint] = useState({ x: 0, y: 0 });
  const [currentTheme, setCurrentTheme] = useState('2024');
  const [tooltip, setTooltip] = useState({ visible: false, content: null, position: { x: 0, y: 0 } });
  const [_hoveredBlock, setHoveredBlock] = useState(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [legendFilter, setLegendFilter] = useState(null);
  const [currentFilter, setCurrentFilter] = useState({ statusFilter: 'all', filteredCamps: [] });
  const [resetSearchFilter, setResetSearchFilter] = useState(false);
  const [legendExpanded, setLegendExpanded] = useState(true);
  const [perfDashVisible, setPerfDashVisible] = useState(false);
  const { urlState, updateUrl, copyToClipboard } = useUrlState();
  const { trackMapLoad, trackSvgLoad, trackDataFetch, _trackUserInteraction, _trackComponentRender } = usePerformanceMonitor({
    enableLogging: process.env.NODE_ENV === 'development',
    trackUserInteractions: true
  });

  // Expose performance tracking to global scope for other hooks
  useEffect(() => {
    window.trackDataFetch = trackDataFetch;
    window.trackMapLoad = trackMapLoad;
    window.trackSvgLoad = trackSvgLoad;
    return () => {
      delete window.trackDataFetch;
      delete window.trackMapLoad; 
      delete window.trackSvgLoad;
    };
  }, [trackDataFetch, trackMapLoad, trackSvgLoad]);

  // Keyboard accessibility handlers
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't interfere with input fields
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      const { key, ctrlKey, metaKey } = event;
      const isModifier = ctrlKey || metaKey;

      switch (key) {
        case '+':
        case '=':
          if (isModifier) {
            event.preventDefault();
            setZoom(prev => Math.min(prev * 1.2, 5));
            logger.ui.action('keyboard zoom in', 'Ctrl/Cmd + +');
          }
          break;
        case '-':
          if (isModifier) {
            event.preventDefault();
            setZoom(prev => Math.max(prev * 0.8, 0.5));
            logger.ui.action('keyboard zoom out', 'Ctrl/Cmd + -');
          }
          break;
        case '0':
          if (isModifier) {
            event.preventDefault();
            setZoom(0.8);
            setPan({ x: 0, y: 84 });
            logger.ui.action('keyboard reset zoom', 'Ctrl/Cmd + 0');
          }
          break;
        case 'Escape':
          event.preventDefault();
          setSelectedBlock(null);
          setSearchVisible(false);
          setStatsVisible(false);
          setShareVisible(false);
          setUpdateVisible(false);
          logger.ui.action('keyboard close panels', 'Escape');
          break;
        case 'f':
        case 'F':
          if (isModifier) {
            event.preventDefault();
            setSearchVisible(true);
            logger.ui.action('keyboard open search', 'Ctrl/Cmd + F');
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setZoom, setPan, setSelectedBlock, setSearchVisible, setStatsVisible, setShareVisible, setUpdateVisible]);


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

  // Mobile legend behavior: collapse when block is selected
  useEffect(() => {
    if (window.innerWidth <= 768 && selectedBlock) {
      setLegendExpanded(false);
    }
  }, [selectedBlock]);

  useEffect(() => {
    if (!svgRef.current || loading) {
      return;
    }

    const svgDoc = svgRef.current.contentDocument;
    if (!svgDoc) return;

    // Extend SVG viewBox to accommodate invisible balancing element and airport
    const svgElement = svgDoc.documentElement;
    if (svgElement && svgElement.getAttribute('viewBox') === '0 0 1160.17 861.54') {
      svgElement.setAttribute('viewBox', '0 0 1240 1011.54');
      logger.map.debug('Extended SVG viewBox to accommodate balancing element and airport');
    }


    // Update gradient references based on current theme
    const gradientId = currentTheme.includes('2024') ? 'cityGradient-2024' : 'cityGradient-2025';
    logger.map.debug('Using gradient ID', { gradientId, theme: currentTheme });

    // Color all blocks and plaza quarters based on camp data - BED colors override gradient
    const blocks = svgDoc.querySelectorAll('#BRC_Polygons_Overlay path, .plaza-quarter');
    logger.map.debug('Found blocks and plaza-quarters', { count: blocks.length });
    blocks.forEach(block => {
      const color = getBlockColor(block.id, camps, currentTheme);
      const campsInBlock = camps.filter(camp => 
        campInBlock(camp.placement_address, block.id)
      );
      
      // Check if this block is currently selected
      const isSelected = selectedBlock === block.id;
      
      // Check if this block should be highlighted due to filtering
      // Priority: Legend filter overrides search filter (mutual exclusion)
      const shouldHighlight = legendFilter 
        ? campsInBlock.some(camp => camp.bed_status === legendFilter)
        : (currentFilter.filteredCamps.length > 0 && 
           currentFilter.filteredCamps.some(camp => campInBlock(camp.placement_address, block.id)));
      
      // Use BED status color as fill if present, otherwise use gradient
      if (color !== THEMES[currentTheme].colors.none) {
        // BED status override - use solid color fill
        block.style.setProperty('fill', color, 'important');
        let fillOpacity = isSelected ? '1.0' : '0.7';
        
        block.style.setProperty('fill-opacity', fillOpacity, 'important');
      } else {
        // No BED status - show gradient with full opacity
        const gradientFill = `url(#${gradientId})`;
        block.style.setProperty('fill', gradientFill, 'important');
        block.style.setProperty('fill-opacity', '1.0', 'important');
      }
      
      block.style.setProperty('cursor', 'pointer', 'important');
      block.style.setProperty('transition', 'all 0.3s ease', 'important');
      
      // Apply filter highlighting for matching blocks - use same glow as selection
      if (shouldHighlight && !isSelected) {
        // Apply white glow highlighting like selection but slightly dimmer
        block.style.setProperty('stroke', '#FFFFFF', 'important');
        block.style.setProperty('stroke-width', '4', 'important');
        block.style.setProperty('stroke-opacity', '0.8', 'important');
        block.style.setProperty('stroke-dasharray', 'none', 'important');
        block.style.setProperty('stroke-linejoin', 'round', 'important');
        block.style.setProperty('stroke-linecap', 'round', 'important');
        
        // Filtered glow effect - slightly dimmer than selection
        const filterGlowFilter = [
          'brightness(1.2)',
          'drop-shadow(0 0 15px rgba(255, 255, 255, 0.8))',
          'drop-shadow(0 0 8px rgba(255, 255, 255, 0.7))',
          'drop-shadow(0 0 4px rgba(255, 255, 255, 0.6))',
          'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.2))'
        ].join(' ');
        block.style.setProperty('filter', filterGlowFilter, 'important');
      } else if (!isSelected) {
        // Remove filter glow for non-matching, non-selected blocks
        if (!block.classList.contains('plaza-quarter')) {
          block.style.setProperty('stroke', 'none', 'important');
          block.style.setProperty('stroke-width', '0', 'important');
        }
        block.style.setProperty('filter', 'none', 'important');
      }
      
      // Apply selection styling if this block is selected (highest priority)
      if (isSelected) {
        // Check if block has unregistered camps (BED status 'none') to determine stroke color
        const isUnregisteredBlock = campsInBlock.length > 0 && campsInBlock.every(camp => camp.bed_status === 'none');
        
        // Use gray for unregistered blocks, white for all others
        const strokeColor = isUnregisteredBlock ? '#9CA3AF' : '#FFFFFF';
        const glowColor = isUnregisteredBlock ? '156, 163, 175' : '255, 255, 255'; // RGB values for rgba
        
        block.style.setProperty('stroke', strokeColor, 'important');
        block.style.setProperty('stroke-width', '6', 'important');
        block.style.setProperty('stroke-opacity', '1.0', 'important');
        block.style.setProperty('stroke-dasharray', 'none', 'important');
        block.style.setProperty('stroke-linejoin', 'round', 'important');
        block.style.setProperty('stroke-linecap', 'round', 'important');
        
        // Multiple layered glow effects using appropriate color
        const glowFilter = [
          'brightness(1.3)',
          `drop-shadow(0 0 20px rgba(${glowColor}, 1.0))`,
          `drop-shadow(0 0 10px rgba(${glowColor}, 0.9))`,
          `drop-shadow(0 0 5px rgba(${glowColor}, 0.8))`,
          'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3))'
        ].join(' ');
        block.style.setProperty('filter', glowFilter, 'important');
        logger.ui.debug(`Applied selection styling to block ${block.id}`, { 
          blockId: block.id, 
          strokeColor: isUnregisteredBlock ? 'gray' : 'white' 
        });
      } else if (!shouldHighlight) {
        // Only remove stroke/filter if block is not highlighted by filter
        if (!block.classList.contains('plaza-quarter')) {
          block.style.setProperty('stroke', 'none', 'important');
          block.style.setProperty('stroke-width', '0', 'important');
        }
        block.style.setProperty('filter', 'none', 'important');
      }
      
      // Enhanced hover effect with tooltip
      block.onmouseenter = (_e) => {
        // Only apply hover effects if block is not already selected
        if (selectedBlock !== block.id) {
          const hoverOpacity = '1.0';
          block.style.setProperty('fill-opacity', hoverOpacity, 'important');
          
          block.style.setProperty('filter', 'brightness(1.1)', 'important');
        }
        setHoveredBlock(block.id);
        
        // Show tooltip with display address
        const _rect = svgRef.current.getBoundingClientRect();
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
        
        const simplifiedName = simplifyPlazaName(displayAddress);
        const tooltipTitle = shouldAddSectorSuffix(block.id) 
          ? `${simplifiedName} Sector`
          : simplifiedName;
        
        const tooltipContent = {
          title: tooltipTitle,
          description: campsInBlock.length > 0 
            ? `${campsInBlock.length} camp${campsInBlock.length > 1 ? 's' : ''} registered`
            : 'No camps registered',
          camps: campsInBlock,
          coordinates: coordinates
        };
        
        // Calculate tooltip position using block's center in SVG coordinates
        const bbox = block.getBBox();
        const blockCenterX = bbox.x + bbox.width / 2;
        const blockCenterY = bbox.y + bbox.height / 2;
        
        // Transform SVG coordinates to screen coordinates
        const svgRect = svgRef.current.getBoundingClientRect();
        
        // Account for current zoom and pan transforms
        const transformedX = (blockCenterX * zoom) + svgRect.left + pan.x;
        const transformedY = (blockCenterY * zoom) + svgRect.top + pan.y;
        
        // Calculate radial offset based on time designation
        let offsetX = 0;
        
        // Parse time from block ID (e.g., "polygon_E_6:30" -> "6:30")
        const timeMatch = block.id.match(/_(\d{1,2}):(\d{2})$/);
        if (timeMatch) {
          const hour = parseInt(timeMatch[1]);
          const minute = parseInt(timeMatch[2]);
          
          // Convert time to total minutes from 12:00
          const totalMinutes = ((hour === 12 ? 0 : hour) * 60) + minute;
          
          // Calculate angle: each hour = 30°, each 30 min = 15°
          // 2:00 = 22.5°, 2:30 = 7.5°, 3:00 = 352.5°, 3:30 = 337.5°
          let theta;
          if (hour === 2 && minute === 0) theta = 22.5;
          else if (hour === 2 && minute === 30) theta = 7.5;
          else if (hour === 3 && minute === 0) theta = 352.5;
          else if (hour === 3 && minute === 30) theta = 337.5;
          else {
            // General formula: start from 3:00 = 352.5°, adjust by time difference
            const minutesFrom3 = totalMinutes - 180; // 3:00 = 180 minutes from 12:00
            theta = 352.5 + (minutesFrom3 * 0.5); // 0.5° per minute
          }
          
          // Convert to radians and calculate X offset with r = 50
          const r = 50;
          const thetaRad = theta * (Math.PI / 180);
          offsetX = r * Math.cos(thetaRad);
        }
        
        // Calculate maximum Y coordinate based on 6:00 & E polygon position
        // Find the 6:00 & E block to get its Y position
        const sixOClockEBlock = svgRef.current?.contentDocument?.getElementById('polygon_E_6:00');
        let maxTooltipY = transformedY; // fallback to current position
        
        if (sixOClockEBlock) {
          const sixBbox = sixOClockEBlock.getBBox();
          const sixCenterY = sixBbox.y + sixBbox.height / 2;
          const sixTransformedY = (sixCenterY * zoom) + svgRect.top + pan.y;
          maxTooltipY = sixTransformedY;
        }
        
        // Use the minimum of current Y position and max Y coordinate
        const finalY = Math.min(transformedY, maxTooltipY);
        
        setTooltip({
          visible: true,
          content: tooltipContent,
          position: {
            x: transformedX + offsetX + 100,
            y: finalY
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
          // Remove selection stroke if not selected (but preserve plaza-quarter strokes)
          if (!block.classList.contains('plaza-quarter')) {
            block.style.setProperty('stroke', 'none', 'important');
            block.style.setProperty('stroke-width', '0', 'important');
          }
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
          logger.map.warn('Camps data not available for click handler');
          setSelectedBlock(block.id);
          setTooltip({ visible: false, content: null, position: { x: 0, y: 0 } });
          return;
        }
        
        const _currentCamps = camps;
        const _currentThemeValue = currentTheme;
        const _currentGradientId = gradientId;
        
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
        setUpdateVisible(false);
      };
    });

    // Handle Airport polygon selection styling and BED status coloring
    const airportPolygon = svgDoc.querySelector('#airport-polygon');
    
    if (airportPolygon) {
      // Check for camps at the Airport location and apply BED status color
      const airportColor = getBlockColor('nimue-artist-credit', camps, currentTheme);
      
      if (selectedBlock === 'nimue-artist-credit') {
        // Apply selection styling but keep the white stroke
        airportPolygon.style.setProperty('stroke', '#FFFFFF', 'important');
        airportPolygon.style.setProperty('stroke-width', '6', 'important');
        airportPolygon.style.setProperty('fill', 'rgba(255, 105, 180, 0.3)', 'important');
        airportPolygon.style.setProperty('filter', 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.5)) drop-shadow(0 0 10px rgba(255, 255, 255, 0.45)) drop-shadow(0 0 5px rgba(255, 255, 255, 0.4))', 'important');
      } else {
        // Reset to default styling with BED status color if available
        airportPolygon.style.setProperty('stroke', 'white', 'important');
        airportPolygon.style.setProperty('stroke-width', '2', 'important');
        
        if (airportColor !== THEMES[currentTheme].colors.none) {
          // BED status override - use solid color fill
          airportPolygon.style.setProperty('fill', airportColor, 'important');
          airportPolygon.style.setProperty('fill-opacity', '0.7', 'important');
        } else {
          // No BED status - use gradient fill
          airportPolygon.style.setProperty('fill', `url(#${gradientId})`, 'important');
          airportPolygon.style.setProperty('fill-opacity', '0.7', 'important');
        }
        
        airportPolygon.style.setProperty('filter', 'none', 'important');
      }
    }

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
      
      logger.map.debug('Medical icon added to SVG', { position: '(943, 271)' });
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
      
      logger.map.debug('Medical icon added to SVG', { position: '(301, 271)', location: '9:00 & C plaza' });
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
      
      logger.map.debug('Medical icon added to SVG', { position: '(712, 487)', location: '5:15 & Esplanade' });
    }

    // Add Ranger HQ icon at 5:45 & Esplanade
    const existingRanger = svgDoc.querySelector('#ranger-hq-icon');
    if (!existingRanger) {
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
      rangerImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/brc-bed-map/Ranger.svg");
      rangerImage.setAttribute("href", "/brc-bed-map/Ranger.svg"); // Fallback for modern browsers
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
      logger.map.debug('Added Ranger HQ icon', { coordinates: '565, 495' });
    }
    
    // Add Airport polygon at bottom right corner (off the map) - simplified Nimue airplane shape
    const existingAirport = svgDoc.querySelector('#airport-polygon');
    if (!existingAirport) {
      const airportPolygon = document.createElementNS("http://www.w3.org/2000/svg", "path");
      airportPolygon.setAttribute("id", "airport-polygon");
      airportPolygon.setAttribute("transform", "translate(1100, 775) scale(0.8)"); // Scale down 80%, moved down 50px
      
      // Actual Nimue airplane shape from traced SVG - scaled and centered
      // Original viewBox: 0 0 270 281, centering around (135, 140.5) and scaling down
      const airplanePath = 'M 63.040 -139.830 C 51.411 -134.765, 50.791 -133.772, 36.504 -97.290 C 30.130 -81.012, 26.260 -72.405, 25.164 -72.066 C 24.249 -71.783, -9.561 -63.657, -49.968 -54.008 C -90.376 -44.358, -123.717 -36.134, -124.060 -35.732 C -125.096 -34.514, -135 -10.748, -135 -9.478 C -135 -8.629, -133.102 -8.460, -128.250 -8.878 C -124.537 -9.198, -95.175 -9.714, -63 -10.025 C -30.825 -10.336, -2.858 -10.827, -0.850 -11.116 L 2.800 -11.642 -14.093 31.089 C -23.384 54.591, -31.102 73.908, -31.243 74.016 C -31.384 74.125, -41.157 76.785, -52.961 79.928 C -78.478 86.723, -75.010 84.850, -78.995 93.989 C -83.090 103.380, -85.475 102.213, -56.666 104.915 L -32.111 107.217 -18.805 118.549 C -11.487 124.782, -2.908 132.117, 0.259 134.848 C 3.426 137.580, 6.212 139.621, 6.449 139.384 C 7.397 138.436, 13 125.223, 13 123.935 C 13 123.177, 8.275 114.065, 2.500 103.686 C -3.275 93.308, -8 84.162, -8 83.362 C -8 82.154, 28.308 1.859, 29.305 0.862 C 29.482 0.685, 50.720 23.037, 76.501 50.533 C 102.282 78.028, 123.669 100.182, 124.029 99.762 C 124.995 98.635, 135 74.828, 135 73.656 C 135 73.105, 117.401 42.893, 95.891 6.519 L 56.781 -59.615 69.641 -87.735 C 83.826 -118.755, 84.245 -120.412, 80.622 -131.193 C 77.186 -141.417, 72.251 -143.842, 63.040 -139.830';
      
      airportPolygon.setAttribute("d", airplanePath);
      
      // Check for camps at the Airport location and apply BED status color
      const airportColor = getBlockColor('nimue-artist-credit', camps, currentTheme);
      if (airportColor !== THEMES[currentTheme].colors.none) {
        // BED status override - use solid color fill
        airportPolygon.setAttribute("fill", airportColor);
        airportPolygon.setAttribute("fill-opacity", "0.7");
      } else {
        // No BED status - use gradient fill
        airportPolygon.setAttribute("fill", `url(#${gradientId})`);
        airportPolygon.setAttribute("fill-opacity", "0.7");
      }
      
      airportPolygon.setAttribute("stroke", "#FFFFFF");
      airportPolygon.setAttribute("stroke-miterlimit", "10");
      airportPolygon.setAttribute("filter", "url(#plazaShadow)");
      airportPolygon.style.setProperty('cursor', 'pointer', 'important');
      airportPolygon.style.setProperty('transition', 'all 0.3s ease', 'important');
      
      // Add hover effects like other blocks
      airportPolygon.onmouseenter = (_e) => {
        airportPolygon.style.setProperty('stroke', 'rgba(255, 105, 180, 1.0)', 'important');
        airportPolygon.style.setProperty('stroke-width', '3', 'important');
        airportPolygon.style.setProperty('filter', 'drop-shadow(0 0 10px rgba(255, 105, 180, 0.8))', 'important');
        
        // Show tooltip (will inherit camp name like other polygons)
        const displayAddress = blockIdToDisplayAddress('nimue-artist-credit');
        
        // Get airport polygon bounding box for positioning
        const bbox = airportPolygon.getBBox();
        const blockCenterX = bbox.x + bbox.width / 2;
        const blockCenterY = bbox.y + bbox.height / 2;
        
        // Transform SVG coordinates to screen coordinates
        const svgRect = svgRef.current.getBoundingClientRect();
        
        // Account for current zoom and pan transforms
        const transformedX = (blockCenterX * zoom) + svgRect.left + pan.x;
        const transformedY = (blockCenterY * zoom) + svgRect.top + pan.y;
        
        // Calculate angle-based offset for tooltip positioning
        // Use The Man's coordinates as the center point
        const mapCenterX = 622.5;
        const mapCenterY = 272.04;
        
        // Calculate angle from map center to block center
        const deltaX = blockCenterX - mapCenterX;
        const deltaY = blockCenterY - mapCenterY;
        let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        
        // Calculate radial offset distance (80px) in the direction away from center
        const offsetDistance = 80;
        const offsetX = Math.cos(angle * (Math.PI / 180)) * offsetDistance;
        const offsetY = Math.sin(angle * (Math.PI / 180)) * offsetDistance;
        
        setTooltip({
          visible: true,
          content: { title: displayAddress, description: "Black Rock City Airport" },
          position: { x: transformedX + offsetX, y: transformedY + offsetY }
        });
      };
      
      airportPolygon.onmouseleave = () => {
        airportPolygon.style.setProperty('stroke', 'white', 'important');
        airportPolygon.style.setProperty('stroke-width', '2', 'important');
        airportPolygon.style.setProperty('filter', 'none', 'important');
        setTooltip({ visible: false, content: null, position: { x: 0, y: 0 } });
      };
      
      // Add click handler for selection
      airportPolygon.onclick = (e) => {
        e.stopPropagation();
        setSelectedBlock('nimue-artist-credit');
        
        // Close other panels when clicked
        setSearchVisible(false);
        setStatsVisible(false);
        setShareVisible(false);
        setUpdateVisible(false);
        
        logger.map.debug('Airport polygon selected');
      };
      
      // Add tooltip title (will inherit camp name like other polygons)
      const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
      title.textContent = blockIdToDisplayAddress('nimue-artist-credit');
      airportPolygon.appendChild(title);
      
      svgDoc.documentElement.appendChild(airportPolygon);
      logger.map.debug('Added Airport polygon', { coordinates: '1100, 775' });
    }

    // Add BED Logo directly to SVG at The Man's coordinates + 15px right
    const existingBedLogo = svgDoc.querySelector('#bed-logo-svg');
    if (!existingBedLogo) {
      const bedLogoGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      bedLogoGroup.setAttribute("id", "bed-logo-svg");
      bedLogoGroup.setAttribute("transform", "translate(612.5, 272.04)"); // The Man's coords - 10px left
      
      // Create SVG image element for the BED logo
      const bedLogoImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
      bedLogoImage.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "/brc-bed-map/logo-4x.png");
      bedLogoImage.setAttribute("href", "/brc-bed-map/logo-4x.png");
      bedLogoImage.setAttribute("x", "-180"); // Center the 360px image
      bedLogoImage.setAttribute("y", "-180"); // Center the 360px image  
      bedLogoImage.setAttribute("width", "360");
      bedLogoImage.setAttribute("height", "360");
      bedLogoImage.setAttribute("preserveAspectRatio", "xMidYMid meet");
      bedLogoImage.style.setProperty('filter', 'drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5))', 'important');
      
      // Add tooltip
      const bedLogoTitle = document.createElementNS("http://www.w3.org/2000/svg", "title");
      bedLogoTitle.textContent = "Bureau of Erotic Discourse";
      
      bedLogoGroup.appendChild(bedLogoImage);
      bedLogoGroup.appendChild(bedLogoTitle);
      
      svgDoc.documentElement.appendChild(bedLogoGroup);
      logger.map.debug('Added BED Logo to SVG', { coordinates: '612.5, 272.04' });
    }

    // Add invisible balancing element to fix SVG centering (mirror of left outpost)
    const existingBalancer = svgDoc.querySelector('#invisible-balancer');
    if (!existingBalancer) {
      const balancerGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      balancerGroup.setAttribute("id", "invisible-balancer");
      balancerGroup.setAttribute("transform", "translate(1226.5, 92.04)"); // Mirror position of left outpost
      
      // Create invisible circle with same dimensions as left outpost
      const balancerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      balancerCircle.setAttribute("cx", "0");
      balancerCircle.setAttribute("cy", "0");
      balancerCircle.setAttribute("r", "12"); // Same size as outpost
      balancerCircle.setAttribute("fill", "transparent");
      balancerCircle.setAttribute("opacity", "0");
      balancerCircle.setAttribute("pointer-events", "none");
      
      balancerGroup.appendChild(balancerCircle);
      svgDoc.documentElement.appendChild(balancerGroup);
      logger.map.debug('Added invisible balancing element', { coordinates: '1226.5, 92.04' });
    }


    // Add BEDtalks.org text centered at The Man's x-coordinate, 400px lower
    const existingBedText = svgDoc.querySelector('#bedtalks-text-svg');
    if (!existingBedText) {
      const bedTextGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      bedTextGroup.setAttribute("id", "bedtalks-text-svg");
      bedTextGroup.setAttribute("transform", "translate(622.5, 847.04)"); // The Man's x-coord, y-coord + 575px
      
      // Create SVG text element for BEDtalks.org
      const bedText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      bedText.setAttribute("x", "0");
      bedText.setAttribute("y", "0");
      bedText.setAttribute("text-anchor", "middle"); // Center the text horizontally
      bedText.setAttribute("dominant-baseline", "middle"); // Center the text vertically
      bedText.setAttribute("font-family", "Arial, sans-serif");
      bedText.setAttribute("font-size", "24");
      bedText.setAttribute("font-weight", "600");
      bedText.setAttribute("fill", "#FFFFFF"); // White text
      bedText.setAttribute("letter-spacing", "0.1em");
      bedText.style.setProperty('filter', 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5))', 'important');
      bedText.textContent = "BEDtalks.org";
      
      // Add tooltip
      const bedTextTitle = document.createElementNS("http://www.w3.org/2000/svg", "title");
      bedTextTitle.textContent = "Visit BEDtalks.org for more information";
      
      bedTextGroup.appendChild(bedText);
      bedTextGroup.appendChild(bedTextTitle);
      
      svgDoc.documentElement.appendChild(bedTextGroup);
      logger.map.debug('Added BEDtalks.org text to SVG', { coordinates: '622.5, 847.04' });
    }

    // Add invisible bottom balancer 100px below airport to ensure glow effects aren't clipped
    const existingBottomBalancer = svgDoc.querySelector('#bottom-balancer');
    if (!existingBottomBalancer) {
      const bottomBalancerGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      bottomBalancerGroup.setAttribute("id", "bottom-balancer");
      bottomBalancerGroup.setAttribute("transform", "translate(1100, 875)"); // 100px below airport at y=775
      
      // Create invisible circle to extend SVG bounds for glow effects
      const bottomBalancerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      bottomBalancerCircle.setAttribute("cx", "0");
      bottomBalancerCircle.setAttribute("cy", "0");
      bottomBalancerCircle.setAttribute("r", "1"); // Minimal size
      bottomBalancerCircle.setAttribute("fill", "transparent");
      bottomBalancerCircle.setAttribute("opacity", "0");
      bottomBalancerCircle.setAttribute("pointer-events", "none");
      
      bottomBalancerGroup.appendChild(bottomBalancerCircle);
      svgDoc.documentElement.appendChild(bottomBalancerGroup);
      logger.map.debug('Added bottom balancer element to prevent glow clipping', { coordinates: '1100, 875' });
    }
  }, [camps, loading, currentTheme, selectedBlock, currentFilter]);

  // Zoom and pan functions
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom * 1.5, 5));
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom / 1.5, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(0.8);
    setPan({ x: 0, y: 84 });
  };

  const handleLegendFilter = (statusFilter) => {
    logger.ui.action('legend filter clicked', statusFilter, { current: legendFilter });
    // Toggle filter - if same status clicked, clear filter
    const newFilter = legendFilter === statusFilter ? null : statusFilter;
    logger.ui.debug('Setting legend filter', { filter: newFilter });
    setLegendFilter(newFilter);
    
    // Update search panel filter to match legend filter - create the filtered camps list
    let filteredCamps = [];
    if (newFilter !== null) {
      // Filter camps based on the legend selection
      if (newFilter === 'all') {
        filteredCamps = camps.filter(camp => 
          camp.bed_status === 'registered' || 
          camp.bed_status === 'consent_policy' || 
          camp.bed_status === 'bed_talk'
        );
      } else {
        filteredCamps = camps.filter(camp => camp.bed_status === newFilter);
      }
    }
    
    // Set the filter state that search panel will sync to
    const filterState = {
      statusFilter: newFilter === null ? 'none' : newFilter,
      filteredCamps: filteredCamps
    };
    
    setCurrentFilter(filterState);
    
    // Trigger search panel reset to sync UI
    setResetSearchFilter(true);
    setTimeout(() => setResetSearchFilter(false), 100);
    
    // Clear any selected block when filtering
    setSelectedBlock(null);
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
      logger.ui.debug('Selected block for camp', { 
        blockId: foundBlockId, 
        campName: camp.camp_name, 
        address: camp.placement_address 
      });
    } else {
      logger.ui.warn('Could not find block for camp', { 
        campName: camp.camp_name, 
        address: camp.placement_address 
      });
    }
  };
  
  const handleFilterChange = useCallback((filterData) => {
    logger.ui.debug('Filter changed', filterData);
    
    // Store the current filter for highlighting blocks
    setCurrentFilter(filterData);
    
    // Set legend filter to match search filter for map highlighting
    // Only set legend filter for specific status filters, not 'all' or 'none'
    if (filterData.statusFilter === 'none' || filterData.statusFilter === 'all') {
      setLegendFilter(null);
    } else {
      // Set legend filter to highlight matching camps on map
      setLegendFilter(filterData.statusFilter);
    }
  }, []);


  const handleDataSourceChange = (newSource) => {
    setDataSource(newSource);
    logger.data.info('Data source changed', { newSource });
  };

  const handleLegendToggle = () => {
    const newExpanded = !legendExpanded;
    setLegendExpanded(newExpanded);
    
    // On mobile, close InfoPanel if legend is being expanded
    if (window.innerWidth <= 768 && newExpanded && selectedBlock) {
      setSelectedBlock(null);
    }
  };

  const handleMouseDown = (_e) => {
    // Panning disabled
    return;
  };

  const handleMouseMove = (_e) => {
    // Panning disabled
    return;
  };

  const handleMouseUp = () => {
    // Panning disabled
    return;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    // Zoom functionality disabled - preventing default scroll behavior only
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
  }, [_isPanning, _lastPanPoint]);

  const theme = THEMES[currentTheme];

  return (
    <>
      
      <div 
        ref={containerRef}
        className="map-container"
        style={{ 
          position: 'relative', 
          width: '100%', 
          height: '100vh', 
          background: theme.background,
          overflow: 'visible',
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
      
      {/* Search Panel - Hidden on mobile */}
      <div className="desktop-only">
        <SearchPanel
          camps={camps}
          theme={currentTheme}
          onCampSelect={handleCampSelect}
          onFilterChange={handleFilterChange}
          onFilterButtonClick={() => setSelectedBlock(null)}
          isVisible={searchVisible}
          onToggle={() => setSearchVisible(!searchVisible)}
          resetFilter={resetSearchFilter}
          currentFilter={currentFilter}
        />
      </div>
      
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
            logger.ui.debug('Coordinate toggle clicked', { newState });
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
            logger.ui.debug('Alternative coordinate toggle clicked', { newState });
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
      
      
      {/* Stats Panel - Hidden on mobile */}
      <div className="desktop-only">
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
      </div>
      
      {/* Share Panel - Hidden on mobile */}
      <div className="desktop-only">
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
      </div>
      
      {/* Update Panel - Hidden on mobile */}
      <div className="desktop-only">
        <UpdatePanel
          theme={currentTheme}
          isVisible={updateVisible}
          onToggle={() => setUpdateVisible(!updateVisible)}
        />
      </div>
      
      {/* Zoom controls - Hidden */}
      {false && (
        <div className="desktop-only">
          <ZoomControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={handleResetZoom}
            currentZoom={zoom}
            theme={currentTheme}
          />
        </div>
      )}
      
      <div
        className="map-container"
          style={{
            width: '100%',
            height: '100%',
            minWidth: '100%',
            minHeight: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            position: 'relative',
            display: 'block',
            overflow: 'visible',
            boxSizing: 'border-box',
            top: window.innerWidth <= 768 ? '-5em' : '0',
            transform: window.innerWidth <= 768 
              ? `scale(1)`
              : `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: _isPanning ? 'none' : 'transform 0.2s ease-out, opacity 0.3s ease',
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
            filter: 'none',
            display: 'block',
            width: '100%',
            height: '100%',
            maxWidth: 'none',
            maxHeight: 'none',
            minWidth: 'auto',
            minHeight: 'auto',
            objectFit: 'contain',
            objectPosition: 'center center'
          }}
          onLoad={() => {
            logger.map.debug('SVG loaded', { 
              hasContentDocument: !!svgRef.current?.contentDocument 
            });
          }}
        />
        
        
        {/* Central B.E.D. Logo - now added directly to SVG, so this component is hidden */}
        {false && <CentralLogo theme={currentTheme} />}
        
        
      </div>
      
      <div className="legend-container">
        <Legend 
          theme={currentTheme} 
          onStatusFilter={handleLegendFilter}
          activeFilter={legendFilter}
          isExpanded={window.innerWidth <= 768 ? legendExpanded : undefined}
          onToggleExpanded={window.innerWidth <= 768 ? handleLegendToggle : undefined}
        />
      </div>
      
      {selectedBlock && (
        <div 
          className="info-panel"
          style={{
            position: window.innerWidth <= 768 ? 'fixed' : 'static',
            bottom: window.innerWidth <= 768 ? '25.5rem' : 'auto',
            left: window.innerWidth <= 768 ? '0rem' : 'auto',
            right: window.innerWidth <= 768 ? '-0.25rem' : 'auto',
            zIndex: window.innerWidth <= 768 ? 40 : 'auto'
          }}
        >
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
      {/* Corner Characters - Hidden on mobile */}
      <div className="desktop-only">
        <CornerCharacters theme={currentTheme} />
      </div>
      
      {/* CSS Animations and SVG element hiding */}
      <style>{`
        @keyframes blockPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes filterPulse {
          0% { opacity: 0.7; }
          50% { opacity: 1.0; }
          100% { opacity: 0.7; }
        }
        
        /* Hide The Man and Temple from the SVG */
        #The_Man {
          display: none !important;
        }
        
        #Temple {
          display: none !important;
        }
        
        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          /* Hide desktop-only elements on mobile */
          .desktop-only {
            display: none !important;
          }
          
          /* Show mobile-only elements on mobile */
          .mobile-only {
            display: block !important;
          }
          
          /* Resize and reposition map container on mobile */
          .map-container:last-of-type {
            width: 100vw !important;
            height: 100vh !important;
            margin-top: 0 !important;
          }
          
          /* Center legend on mobile and raise it slightly */
          .legend-container {
            position: fixed !important;
            bottom: 1rem !important; /* Moved down to 1rem */
            left: 50% !important;
            transform: translateX(-50%) !important;
            z-index: 40 !important; /* Increased to be above SearchPanel */
            width: auto !important;
          }
          
          /* Override legend internal positioning and make it wider on mobile */
          .legend-container > div {
            position: relative !important;
            bottom: auto !important;
            left: auto !important;
            width: 90vw !important; /* Use most of screen width */
            max-width: 600px !important; /* Reasonable max width */
          }
          
          /* Make legend items flow horizontally to reduce height when expanded */
          .legend-container > div > div[style*="flex-direction: column"] {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            gap: 0.75rem !important;
            justify-content: center !important;
          }
          
          /* Style individual legend items for horizontal layout */
          .legend-container > div > div[style*="flex-direction: column"] > div {
            flex: 0 1 auto !important;
            min-width: 120px !important;
            text-align: center !important;
          }
          
          /* Hide the desert icon in the last updated section on mobile */
          .legend-desert-icon {
            display: none !important;
          }
          
          /* Shrink BED header by 40% total on mobile and adjust positioning */
          .bed-header-image {
            width: 480px !important; /* 640px * 0.75 = 480px (25% additional reduction) */
          }
          
          .bed-header-container {
            top: -8rem !important; /* Bring header down to restore proper spacing */
          }
          
          /* BED logo is now SVG-based and scales automatically with the map */
          
          /* Share panel is hidden on mobile via desktop-only wrapper */
          
          /* Update panel is hidden on mobile via desktop-only wrapper */
          
          /* Legend date positioning - mobile uses header, desktop uses footer */
          .legend-header-date {
            display: block !important;
          }
          
          .legend-footer-date {
            display: none !important;
          }
        }
        
        /* Robust map container styling to prevent size changes */
        .map-container {
          contain: layout style !important;
          isolation: isolate !important;
        }
        
        .map-container object {
          contain: layout style !important;
          isolation: isolate !important;
        }
        
        /* Desktop legend date positioning - hide header date, show footer date */
        @media (min-width: 769px) {
          /* Hide mobile-only elements on desktop */
          .mobile-only {
            display: none !important;
          }
          
          .legend-header-date {
            display: none !important;
          }
          
          .legend-footer-date {
            display: flex !important;
          }
        }
      `}</style>
    </div>

    {/* Performance Dashboard - Development Only */}
    {process.env.NODE_ENV === 'development' && (
      <PerformanceDashboard
        theme={currentTheme}
        isVisible={perfDashVisible}
        onToggle={() => setPerfDashVisible(!perfDashVisible)}
        position="bottom-left"
      />
    )}
    </>
  );
};

export default MapView;