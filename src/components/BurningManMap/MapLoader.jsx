import React, { useEffect, useState } from 'react';

export const MapLoader = () => {
  const [svgContent, setSvgContent] = useState(null);

  useEffect(() => {
    fetch('/assets/brc-2025-base.svg')
      .then(res => res.text())
      .then(setSvgContent)
      .catch(err => console.error('Failed to load SVG:', err));
  }, []);

  if (!svgContent) return <div>Loading map...</div>;

  return (
    <div
      className="w-full h-screen"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};
