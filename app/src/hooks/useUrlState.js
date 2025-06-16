import { useEffect, useState, useCallback } from 'react';

export const useUrlState = () => {
  const [urlState, setUrlState] = useState({
    theme: '2025',
    zoom: 1,
    pan: { x: 0, y: 0 },
    selectedBlock: null,
    search: ''
  });

  // Parse URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const newState = {
      theme: '2025',
      zoom: 1,
      pan: { x: 0, y: 0 },
      selectedBlock: null,
      search: ''
    };
    
    // Parse theme
    const theme = urlParams.get('theme');
    if (theme && ['2024', '2025'].includes(theme)) {
      newState.theme = theme;
    }
    
    // Parse zoom
    const zoom = urlParams.get('zoom');
    if (zoom) {
      const parsedZoom = parseFloat(zoom);
      if (!isNaN(parsedZoom) && parsedZoom >= 0.5 && parsedZoom <= 5) {
        newState.zoom = parsedZoom;
      }
    }
    
    // Parse pan
    const panX = urlParams.get('panX');
    const panY = urlParams.get('panY');
    if (panX && panY) {
      const parsedPanX = parseFloat(panX);
      const parsedPanY = parseFloat(panY);
      if (!isNaN(parsedPanX) && !isNaN(parsedPanY)) {
        newState.pan = { x: parsedPanX, y: parsedPanY };
      }
    }
    
    // Parse selected block
    const selectedBlock = urlParams.get('block');
    if (selectedBlock) {
      newState.selectedBlock = selectedBlock;
    }
    
    // Parse search term
    const search = urlParams.get('search');
    if (search) {
      newState.search = decodeURIComponent(search);
    }
    
    setUrlState(newState);
  }, []);

  // Update URL when state changes (without updating internal state to prevent loops)
  const updateUrl = useCallback((newState) => {
    const url = new URL(window.location);
    const params = url.searchParams;
    
    // Update theme
    if (newState.theme && newState.theme !== '2025') {
      params.set('theme', newState.theme);
    } else {
      params.delete('theme');
    }
    
    // Update zoom
    if (newState.zoom && newState.zoom !== 1) {
      params.set('zoom', newState.zoom.toFixed(2));
    } else {
      params.delete('zoom');
    }
    
    // Update pan
    if (newState.pan && (newState.pan.x !== 0 || newState.pan.y !== 0)) {
      params.set('panX', newState.pan.x.toFixed(0));
      params.set('panY', newState.pan.y.toFixed(0));
    } else {
      params.delete('panX');
      params.delete('panY');
    }
    
    // Update selected block
    if (newState.selectedBlock) {
      params.set('block', newState.selectedBlock);
    } else {
      params.delete('block');
    }
    
    // Update search term
    if (newState.search) {
      params.set('search', encodeURIComponent(newState.search));
    } else {
      params.delete('search');
    }
    
    // Update URL without page reload
    const newUrl = `${url.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
    
    // Don't call setUrlState here to prevent circular updates
  }, []);

  // Generate shareable URL
  const generateShareUrl = useCallback((state) => {
    const url = new URL(window.location.origin + window.location.pathname);
    const params = url.searchParams;
    
    if (state.theme && state.theme !== '2025') {
      params.set('theme', state.theme);
    }
    
    if (state.zoom && state.zoom !== 1) {
      params.set('zoom', state.zoom.toFixed(2));
    }
    
    if (state.pan && (state.pan.x !== 0 || state.pan.y !== 0)) {
      params.set('panX', state.pan.x.toFixed(0));
      params.set('panY', state.pan.y.toFixed(0));
    }
    
    if (state.selectedBlock) {
      params.set('block', state.selectedBlock);
    }
    
    if (state.search) {
      params.set('search', encodeURIComponent(state.search));
    }
    
    return url.toString();
  }, []);

  // Copy URL to clipboard
  const copyToClipboard = useCallback(async (state) => {
    const shareUrl = generateShareUrl(state);
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        return { success: true, url: shareUrl };
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        return { success: successful, url: shareUrl };
      }
    } catch (err) {
      console.error('Failed to copy URL:', err);
      return { success: false, url: shareUrl, error: err };
    }
  }, [generateShareUrl]);

  return {
    urlState,
    updateUrl,
    generateShareUrl,
    copyToClipboard
  };
};