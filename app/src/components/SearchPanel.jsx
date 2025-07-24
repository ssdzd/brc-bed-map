import React, { useState, useEffect, useRef, memo } from 'react';
import { THEMES } from '../utils/blockUtils';
import { PlayaIcons, StatusIcon } from './PlayaIcons';

const SearchPanel = memo(({ 
  camps, 
  theme = '2025', 
  onCampSelect, 
  onFilterChange,
  onFilterButtonClick,
  isVisible = false,
  onToggle,
  resetFilter = false,
  currentFilter = { statusFilter: 'none', filteredCamps: [] }
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [filteredCamps, setFilteredCamps] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [scrollTop, setScrollTop] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(200);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const themeConfig = THEMES[theme];
  
  // Reset filter when resetFilter prop changes
  useEffect(() => {
    if (resetFilter) {
      setSelectedFilter('none');
      setSearchTerm('');
    }
  }, [resetFilter]);
  
  // Set 'All Camps' as default when panel becomes visible
  useEffect(() => {
    if (isVisible && selectedFilter === 'none') {
      setSelectedFilter('all');
    }
  }, [isVisible]);
  
  // Sync search panel filter with external filter changes (from legend)
  useEffect(() => {
    if (currentFilter && currentFilter.statusFilter !== selectedFilter && !resetFilter && !isSyncing) {
      // Only sync if not in middle of a reset or already syncing to prevent loops
      setIsSyncing(true);
      setSelectedFilter(currentFilter.statusFilter);
      // Also sync the filtered camps from external source
      setFilteredCamps(currentFilter.filteredCamps);
      setTimeout(() => setIsSyncing(false), 50); // Short delay to prevent immediate re-sync
    }
  }, [currentFilter.statusFilter, selectedFilter, resetFilter, isSyncing]);
  
  const filterOptions = [
    { value: 'all', label: 'All Camps', icon: PlayaIcons.Camp },
    { value: 'registered', label: 'Started BEDucator program', icon: PlayaIcons.VideoPlay },
    { value: 'consent_policy', label: 'Distributed Consent Policy', icon: PlayaIcons.Buddy },
    { value: 'bed_talk', label: 'Scheduled BED talk', icon: PlayaIcons.CheckMark }
  ];
  
  useEffect(() => {
    let filtered = camps;
    
    // Apply status filter
    if (selectedFilter === 'all') {
      // "All Camps" shows only camps with BED progress (orange/purple/pink)
      filtered = filtered.filter(camp => 
        camp.bed_status === 'registered' || 
        camp.bed_status === 'consent_policy' || 
        camp.bed_status === 'bed_talk'
      );
    } else if (selectedFilter === 'none') {
      // "None" shows no camps (empty state)
      filtered = [];
    } else {
      filtered = filtered.filter(camp => camp.bed_status === selectedFilter);
    }
    
    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(camp => 
        camp.camp_name.toLowerCase().includes(term) ||
        camp.placement_address.toLowerCase().includes(term) ||
        (camp.user_name && camp.user_name.toLowerCase().includes(term))
      );
    }
    
    setFilteredCamps(filtered);
    
    // Notify parent of filter changes only if not syncing from external changes
    if (onFilterChange && !isSyncing && !resetFilter) {
      const newFilterData = {
        searchTerm,
        statusFilter: selectedFilter,
        filteredCamps: filtered
      };
      
      onFilterChange(newFilterData);
    }
  }, [searchTerm, selectedFilter, camps]);
  
  // Update dimensions when content changes
  useEffect(() => {
    if (containerRef.current && contentRef.current) {
      const newContainerHeight = containerRef.current.clientHeight;
      const newContentHeight = contentRef.current.scrollHeight;
      setContainerHeight(newContainerHeight);
      setContentHeight(newContentHeight);
    }
  }, [filteredCamps, isExpanded]);
  
  if (!isVisible) {
    return (
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 35
        }}
      >
        <button
          onClick={() => onToggle && onToggle()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#FE8803',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '2rem',
            fontFamily: themeConfig.typography.primaryFont,
            fontWeight: '600',
            fontSize: '0.875rem',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(254,136,3,0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 12px 35px rgba(254,136,3,0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0px)';
            e.target.style.boxShadow = '0 8px 25px rgba(254,136,3,0.3)';
          }}
        >
          🔍 Search Camps
        </button>
      </div>
    );
  }
  
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '850px',
        maxWidth: '95vw',
        backgroundColor: themeConfig.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.98)',
        borderRadius: '1rem',
        boxShadow: themeConfig.isDark 
          ? '0 25px 50px rgba(255, 105, 180, 0.15), 0 10px 20px rgba(0, 0, 0, 0.4)'
          : '0 25px 50px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.05)',
        border: themeConfig.isDark ? '2px solid rgba(255,255,255,0.2)' : '2px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(20px)',
        zIndex: 35,
        transition: 'all 0.3s ease',
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem 1rem 0.25rem',
        borderBottom: `1px solid ${themeConfig.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: 'bold',
          fontFamily: themeConfig.typography.headingFont,
          color: themeConfig.textColor,
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🔍 Search & Filter
        </h3>
        <button
          onClick={() => onToggle && onToggle()}
          style={{
            background: 'none',
            border: 'none',
            color: themeConfig.textColor,
            opacity: 0.6,
            cursor: 'pointer',
            fontSize: '1.25rem',
            padding: '0.25rem',
            borderRadius: '0.25rem',
            transition: 'opacity 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.opacity = '1'}
          onMouseOut={(e) => e.target.style.opacity = '0.6'}
        >
          ✕
        </button>
      </div>
      
      {/* Search Input */}
      <div style={{ padding: '0.5rem 1rem 0.25rem' }}>
        <input
          type="text"
          placeholder="Search camps, addresses, or organizers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: `2px solid ${themeConfig.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '0.5rem',
            backgroundColor: themeConfig.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
            color: themeConfig.textColor,
            fontFamily: themeConfig.typography.primaryFont,
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#FE8803';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = themeConfig.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
          }}
        />
      </div>
      
      {/* Filter Buttons */}
      <div style={{ padding: '0 1rem 0.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.375rem',
          marginBottom: '0.5rem'
        }}>
          {filterOptions.map(option => {
            const IconComponent = option.icon;
            const isSelected = selectedFilter === option.value;
            
            // Get the BED status color for this option
            const getStatusColor = (status) => {
              switch (status) {
                case 'none': return themeConfig.colors.none; // Gray
                case 'registered': return themeConfig.colors.registered; // Orange  
                case 'consent_policy': return themeConfig.colors.consent_policy; // Purple
                case 'bed_talk': return themeConfig.colors.bed_talk; // Hot Pink
                default: return theme === '2024' ? '#FF69B4' : '#3B82F6'; // Default theme color
              }
            };
            
            const statusColor = getStatusColor(option.value);
            
            return (
              <button
                key={option.value}
                onClick={() => {
                  // Toggle functionality - clicking same filter deselects it to 'none' state
                  const newValue = selectedFilter === option.value ? 'none' : option.value;
                  setSelectedFilter(newValue);
                  if (onFilterButtonClick) onFilterButtonClick();
                }}
                style={{
                  padding: '0.375rem 0.5rem',
                  border: `2px solid ${isSelected 
                    ? statusColor
                    : (themeConfig.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)')
                  }`,
                  borderRadius: '0.5rem',
                  backgroundColor: isSelected
                    ? `${statusColor}20` // 20% opacity of status color
                    : 'transparent',
                  color: themeConfig.textColor,
                  fontFamily: themeConfig.typography.primaryFont,
                  fontSize: '0.7rem',
                  fontWeight: isSelected ? '600' : '400',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.target.style.backgroundColor = themeConfig.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                    e.target.style.borderColor = `${statusColor}60`; // 60% opacity on hover
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderColor = themeConfig.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
                  }
                }}
              >
                {/* Use StatusIcon for non-'all' options, PlayaIcon for 'all' */}
                {option.value === 'all' ? (
                  <IconComponent size="0.875rem" />
                ) : (
                  <StatusIcon 
                    status={option.value} 
                    size="1rem" 
                    animated={false}
                  />
                )}
                {option.label}
              </button>
            );
          })}
        </div>
        
        {/* Results Summary */}
        <div style={{
          fontSize: '0.8rem',
          color: themeConfig.textColor,
          opacity: 0.7,
          fontFamily: themeConfig.typography.primaryFont,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>
            {filteredCamps.length} camp{filteredCamps.length !== 1 ? 's' : ''} found
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FE8803',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontFamily: themeConfig.typography.primaryFont,
              fontWeight: '500'
            }}
          >
            {isExpanded ? 'Hide Results' : 'Show Results'}
          </button>
        </div>
      </div>
      
      {/* Results List with Custom Scrolling */}
      {isExpanded && filteredCamps.length > 0 && (
        <div style={{ position: 'relative' }}>
          {/* Scrollable Container */}
          <div 
            ref={containerRef}
            onWheel={(e) => {
              e.preventDefault();
              const newScrollTop = Math.max(0, Math.min(scrollTop + e.deltaY, contentHeight - containerHeight));
              setScrollTop(newScrollTop);
            }}
            style={{
              height: '200px',
              overflow: 'hidden',
              borderTop: `1px solid ${themeConfig.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              padding: '0.75rem 1.25rem',
              position: 'relative'
            }}
          >
            <div 
              ref={contentRef}
              style={{
                transform: `translateY(-${scrollTop}px)`,
                transition: 'transform 0.1s ease'
              }}>
              <div 
                className="search-results-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.5rem'
                }}>
                {filteredCamps.slice(0, 30).map((camp, index) => (
                <div
                  key={camp.id}
                  onClick={() => onCampSelect && onCampSelect(camp)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${themeConfig.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    animation: `fadeInUp 0.3s ease-out ${index * 0.02}s both`,
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = themeConfig.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    color: themeConfig.textColor,
                    fontFamily: themeConfig.typography.primaryFont,
                    marginBottom: '0.25rem',
                    lineHeight: '1.2'
                  }}>
                    {camp.camp_name}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: themeConfig.textColor,
                    opacity: 0.7,
                    fontFamily: themeConfig.typography.primaryFont,
                    lineHeight: '1.1'
                  }}>
                    📍 {camp.placement_address}
                  </div>
                </div>
                ))}
              </div>
              {filteredCamps.length > 30 && (
                <div style={{
                  textAlign: 'center',
                  fontSize: '0.75rem',
                  color: themeConfig.textColor,
                  opacity: 0.6,
                  fontFamily: themeConfig.typography.primaryFont,
                  marginTop: '0.75rem'
                }}>
                  Showing first 30 of {filteredCamps.length} results
                </div>
              )}
            </div>
          </div>
          
          {/* Custom Scrollbar */}
          {contentHeight > containerHeight && (
            <div style={{
              position: 'absolute',
              right: '5px',
              top: '5px',
              bottom: '5px',
              width: '12px',
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '6px'
            }}>
              <div 
                style={{
                  position: 'absolute',
                  top: `${(scrollTop / (contentHeight - containerHeight)) * (containerHeight - 40)}px`,
                  width: '12px',
                  height: '40px',
                  backgroundColor: '#FE8803',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  // Add drag functionality if needed
                }}
              />
            </div>
          )}
        </div>
      )}
      
      {/* CSS Animations and Scrolling */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        
        /* Responsive grid columns */
        @media (max-width: 768px) {
          .search-results-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 480px) {
          .search-results-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
});

SearchPanel.displayName = 'SearchPanel';

export default SearchPanel;