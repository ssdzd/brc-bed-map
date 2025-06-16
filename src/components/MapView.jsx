import React, { useEffect, useState, useRef } from 'react';
import { useMapData } from '../hooks/useMapData';
import { getBlockColor } from '../utils/blockUtils';
import InfoPanel from './InfoPanel';
import Legend from './Legend';

const MapView = () => {
  const svgRef = useRef(null);
  const { camps, loading } = useMapData();
  const [selectedBlock, setSelectedBlock] = useState(null);

  useEffect(() => {
    if (!svgRef.current || loading) return;

    const svgDoc = svgRef.current.contentDocument;
    if (!svgDoc) return;

    // Color all blocks based on camp data
    const blocks = svgDoc.querySelectorAll('#Block_Overlays path');
    blocks.forEach(block => {
      const color = getBlockColor(block.id, camps);
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
  }, [camps, loading]);

  return (
    <div className="relative w-full h-screen bg-gray-100">
      <h1 className="absolute top-4 left-4 text-2xl font-bold z-10">
        Burning Man BED Map
      </h1>
      
      <object
        ref={svgRef}
        data="/merged_map_full.svg"
        type="image/svg+xml"
        className="w-full h-full"
        onLoad={() => console.log('SVG loaded')}
      />
      
      <Legend />
      
      {selectedBlock && (
        <InfoPanel 
          blockId={selectedBlock} 
          camps={camps}
          onClose={() => setSelectedBlock(null)}
        />
      )}
    </div>
  );
};

export default MapView; 