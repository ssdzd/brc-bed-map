import React, { useEffect, useRef } from 'react';

const RoadSystem = ({ theme = '2025', svgRef }) => {
  const roadStylesRef = useRef(null);
  
  // Map theme variants to base themes
  const baseTheme = theme.includes('2024') ? '2024' : '2025';

  useEffect(() => {
    if (!svgRef?.current) return;

    const svgDoc = svgRef.current.contentDocument;
    if (!svgDoc) return;

    // Define road styling based on theme
    const roadStyles = {
      '2025': {
        esplanade: {
          stroke: '#FFFFFF',
          strokeWidth: '4',
          strokeOpacity: '0.9',
          fill: 'none'
        },
        streets: {
          stroke: '#FFFFFF', 
          strokeWidth: '2.5',
          strokeOpacity: '0.85',
          fill: 'none'
        },
        radials: {
          stroke: '#FFFFFF',
          strokeWidth: '1.5', 
          strokeOpacity: '0.8',
          fill: 'none'
        },
        portals: {
          stroke: '#FFD700',
          strokeWidth: '3',
          strokeOpacity: '0.9',
          fill: 'none'
        }
      },
      '2024': {
        esplanade: {
          stroke: '#FFFFFF',
          strokeWidth: '4',
          strokeOpacity: '0.95',
          fill: 'none'
        },
        streets: {
          stroke: '#FFFFFF',
          strokeWidth: '2.5', 
          strokeOpacity: '0.9',
          fill: 'none'
        },
        radials: {
          stroke: '#FFFFFF',
          strokeWidth: '1.5',
          strokeOpacity: '0.85',
          fill: 'none'
        },
        portals: {
          stroke: '#FFD700',
          strokeWidth: '3',
          strokeOpacity: '0.95',
          fill: 'none'
        }
      }
    };

    const currentStyles = roadStyles[baseTheme];

    // Apply styling to different road elements
    const applyRoadStyling = () => {
      console.log('Applying road styling for theme:', baseTheme);
      console.log('SVG document:', svgDoc);
      console.log('SVG document ready state:', svgDoc.readyState);
      
      // For official themes, apply full road styling
      const isOfficialTheme = theme.includes('official');
      
      if (isOfficialTheme) {
        // Style Esplanade (inner ring) - shadows now handled in SVG
        const esplanade = svgDoc.querySelector('#Esplanade path');
        if (esplanade) {
          console.log('Styling Esplanade');
          Object.assign(esplanade.style, currentStyles.esplanade);
        } else {
          console.log('Esplanade not found');
        }
      }

      if (isOfficialTheme) {
        // Style main streets (A through K rings) - shadows now handled in SVG
        const streetRings = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
        let streetsFound = 0;
        streetRings.forEach(ring => {
          const ringPath = svgDoc.querySelector(`#${ring} path`);
          if (ringPath) {
            streetsFound++;
            Object.assign(ringPath.style, currentStyles.streets);
          }
        });
        console.log(`Found ${streetsFound} street rings out of ${streetRings.length}`);
      }

      // Style main radial roads (including 3:00-9:00, 6:00, etc.)
      const mainRadialGroups = svgDoc.querySelectorAll('#Main_Radial_Roads g');
      console.log('Found main radial groups:', mainRadialGroups.length);
      mainRadialGroups.forEach(group => {
        console.log('Processing main radial group:', group.id);
        const lines = group.querySelectorAll('line');
        lines.forEach(line => {
          // Only style lines with cls-1 class (visible segments)
          if (line.classList.contains('cls-1')) {
            console.log('Styling visible road segment:', line);
            Object.assign(line.style, {
              stroke: '#FFFFFF',
              strokeWidth: '4',
              strokeOpacity: '1',
              fill: 'none'
            });
          }
        });
      });

      if (isOfficialTheme) {
        // Style radial roads (time lines) - shadows now handled in SVG
        const radialGroups = svgDoc.querySelectorAll('#Secondary_Radial_Roads g');
        radialGroups.forEach(group => {
          const paths = group.querySelectorAll('path');
          paths.forEach(path => {
            Object.assign(path.style, currentStyles.radials);
          });
        });

        // Style portal roads - shadows now handled in SVG
        const portalGroups = svgDoc.querySelectorAll('#Portals g');
        portalGroups.forEach(group => {
          const paths = group.querySelectorAll('path');
          paths.forEach(path => {
            Object.assign(path.style, currentStyles.portals);
          });
        });

        // Style plazas as white circles with borders - shadows now handled in SVG
        const plazas = svgDoc.querySelectorAll('#Plazas circle');
        plazas.forEach(plaza => {
          plaza.style.fill = '#FFFFFF';
          plaza.style.fillOpacity = '0.9';
          plaza.style.stroke = baseTheme === '2025' ? '#E5E7EB' : '#FFFFFF';
          plaza.style.strokeWidth = '1';
        });

        // Style plaza quarters (decorative elements around plazas)
        const plazaQuarters = svgDoc.querySelectorAll('.plaza-quarter');
        plazaQuarters.forEach(quarter => {
          quarter.style.stroke = '#F3F4F6';
          quarter.style.strokeWidth = '0.8';
          quarter.style.strokeOpacity = '0.7';
          quarter.style.fill = 'none';
        });
      }
      
      // Note: White fill styling is now handled in SVG directly
      
      // Note: Road styling is now handled directly in SVG file
    };

    // Apply styling immediately and on SVG load
    applyRoadStyling();
    
    // Also apply when SVG finishes loading (in case it's still loading)
    const handleSvgLoad = () => {
      setTimeout(applyRoadStyling, 100);
    };
    
    svgRef.current.addEventListener('load', handleSvgLoad);

    return () => {
      if (svgRef.current) {
        svgRef.current.removeEventListener('load', handleSvgLoad);
      }
    };
  }, [theme, svgRef]);

  // Create a style element for additional CSS that can't be applied via JS
  useEffect(() => {
    if (!roadStylesRef.current) return;

    const styleContent = `
      /* Road system base styles */
      .road-system {
        pointer-events: none;
      }

      /* Smooth transitions for theme changes */
      .road-element {
        transition: stroke 0.3s ease, stroke-width 0.3s ease, opacity 0.3s ease;
      }

      /* Enhanced visibility for roads over gradients */
      .road-primary {
        mix-blend-mode: ${baseTheme === '2025' ? 'normal' : 'screen'};
      }

      /* Plaza styling enhancements */
      .plaza-enhanced {
        filter: drop-shadow(0 0 4px rgba(255,255,255,0.5));
      }

      /* Animation for road highlights */
      @keyframes roadPulse {
        0% { stroke-opacity: 0.8; }
        50% { stroke-opacity: 1; }
        100% { stroke-opacity: 0.8; }
      }

      .road-highlight {
        animation: roadPulse 2s ease-in-out infinite;
      }
    `;

    roadStylesRef.current.textContent = styleContent;
  }, [baseTheme]);

  return (
    <style ref={roadStylesRef} />
  );
};

export default RoadSystem;