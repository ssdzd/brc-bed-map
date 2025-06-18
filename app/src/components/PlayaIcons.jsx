import React from 'react';

// Playa-themed icon components
export const PlayaIcons = {
  // Camp and location icons
  Camp: ({ size = '1rem', color = 'currentColor' }) => (
    <span style={{ fontSize: size, color }}>🏕️</span>
  ),
  
  Tent: ({ size = '1rem', color = 'currentColor' }) => (
    <span style={{ fontSize: size, color }}>⛺</span>
  ),
  
  RV: ({ size = '1rem', color = 'currentColor' }) => (
    <span style={{ fontSize: size, color }}>🚐</span>
  ),
  
  ArtCar: ({ size = '1rem', color = 'currentColor' }) => (
    <span style={{ fontSize: size, color }}>🎨🚗</span>
  ),
  
  // Direction and movement icons
  Bike: ({ size = '1rem', color = 'currentColor' }) => (
    <span style={{ fontSize: size, color }}>🚲</span>
  ),
  
  Walking: ({ size = '1rem', color = 'currentColor' }) => (
    <span style={{ fontSize: size, color }}>🚶</span>
  ),
  
  Compass: ({ size = '1rem', color = 'currentColor' }) => (
    <span style={{ fontSize: size, color }}>🧭</span>
  ),
  
  // Playa environment icons
  Sun: ({ size = '1rem', color = 'currentColor' }) => (
    <span style={{ fontSize: size, color }}>☀️</span>
  ),
  
  Dust: ({ size = '1rem', color = 'currentColor' }) => (
    <span style={{ fontSize: size, color }}>💨</span>
  ),
  
  Fire: ({ size = '1rem', color = 'currentColor' }) => (
    <span style={{ fontSize: size, color }}>🔥</span>
  ),
  
  // BED program specific icons
  VideoPlay: ({ size = '1rem', color = 'currentColor' }) => (
    <span style={{ fontSize: size, color }}>▶️</span>
  ),
  
  Buddy: ({ size = '1rem', color = 'currentColor' }) => (
    <span style={{ fontSize: size, color }}>👥</span>
  ),
  
  CheckMark: ({ size = '1rem', color = 'currentColor' }) => (
    <span style={{ fontSize: size, color }}>✅</span>
  ),
  
  Heart: ({ size = '1rem', color = 'currentColor' }) => (
    <span style={{ fontSize: size, color }}>💖</span>
  ),
  
  // Festival and community icons
  Music: ({ size = '1rem', color = 'currentColor' }) => (
    <span style={{ fontSize: size, color }}>🎵</span>
  ),
  
  Art: ({ size = '1rem', color = 'currentColor' }) => (
    <span style={{ fontSize: size, color }}>🎨</span>
  ),
  
  Community: ({ size = '1rem', color = 'currentColor' }) => (
    <span style={{ fontSize: size, color }}>🫂</span>
  ),
  
  Celebration: ({ size = '1rem', color = 'currentColor' }) => (
    <span style={{ fontSize: size, color }}>🎉</span>
  ),
  
  // Specialized BRC icons
  TheMan: ({ size = '1rem', color = 'currentColor' }) => (
    <span style={{ fontSize: size, color }}>🕺</span>
  ),
  
  Temple: ({ size = '1rem', color = 'currentColor' }) => (
    <span style={{ fontSize: size, color }}>🏛️</span>
  ),
  
  Esplanade: ({ size = '1rem', color = 'currentColor' }) => (
    <span style={{ fontSize: size, color }}>🛤️</span>
  )
};

// Animated icon wrapper component
export const AnimatedIcon = ({ 
  children, 
  animation = 'none', 
  duration = '2s', 
  delay = '0s' 
}) => {
  const animations = {
    spin: 'iconSpin',
    bounce: 'iconBounce', 
    pulse: 'iconPulse',
    shake: 'iconShake',
    float: 'iconFloat'
  };
  
  return (
    <span
      style={{
        display: 'inline-block',
        animation: animation !== 'none' 
          ? `${animations[animation]} ${duration} ease-in-out infinite ${delay}`
          : 'none'
      }}
    >
      {children}
      
      <style>{`
        @keyframes iconSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes iconBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        
        @keyframes iconShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </span>
  );
};

// Icon status indicator component
export const StatusIcon = ({ status, size = '1rem', animated = false }) => {
  const statusConfig = {
    none: { icon: PlayaIcons.Camp, animation: 'none' },
    registered: { icon: PlayaIcons.VideoPlay, animation: 'pulse' },
    consent_policy: { icon: PlayaIcons.Buddy, animation: 'bounce' },
    bed_talk: { icon: PlayaIcons.CheckMark, animation: 'spin' }
  };
  
  const config = statusConfig[status] || statusConfig.none;
  const IconComponent = config.icon;
  
  if (animated) {
    return (
      <AnimatedIcon animation={config.animation} duration="2s">
        <IconComponent size={size} />
      </AnimatedIcon>
    );
  }
  
  return <IconComponent size={size} />;
};

// Direction indicator component
export const DirectionIndicator = ({ direction = 'north', size = '1rem', theme = '2025' }) => {
  const directions = {
    north: '↑',
    south: '↓', 
    east: '→',
    west: '←',
    northeast: '↗',
    northwest: '↖',
    southeast: '↘',
    southwest: '↙'
  };
  
  return (
    <span
      style={{
        fontSize: size,
        display: 'inline-block',
        transform: 'rotate(0deg)',
        transition: 'transform 0.3s ease',
        color: theme === '2024' ? '#FFD700' : '#3B82F6',
        textShadow: theme === '2024' ? '1px 1px 2px rgba(0,0,0,0.5)' : 'none'
      }}
    >
      {directions[direction] || directions.north}
    </span>
  );
};