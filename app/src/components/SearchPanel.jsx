import React, { useState, useEffect } from 'react';
import { THEMES } from '../utils/blockUtils';
import { PlayaIcons } from './PlayaIcons';

const SearchPanel = ({ 
  camps, 
  theme = '2025', 
  onCampSelect, 
  onFilterChange,
  isVisible = false,
  onToggle 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [filteredCamps, setFilteredCamps] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const themeConfig = THEMES[theme];
  
  const filterOptions = [
    { value: 'all', label: 'All Camps', icon: PlayaIcons.Camp },
    { value: 'none', label: 'No Engagement', icon: PlayaIcons.Camp },
    { value: 'video_complete', label: 'Video Complete', icon: PlayaIcons.VideoPlay },
    { value: 'buddy_assigned', label: 'Buddy Assigned', icon: PlayaIcons.Buddy },
    { value: 'fully_implemented', label: 'Fully Implemented', icon: PlayaIcons.CheckMark }
  ];
  
  useEffect(() => {
    let filtered = camps;
    
    // Apply status filter
    if (selectedFilter !== 'all') {
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
    
    // Notify parent of filter changes
    if (onFilterChange) {
      onFilterChange({
        searchTerm,
        statusFilter: selectedFilter,
        filteredCamps: filtered
      });
    }
  }, [searchTerm, selectedFilter, camps, onFilterChange]);
  
  if (!isVisible) {
    // Collapsed state - just show search toggle button
    return (
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20
        }}
      >
        <button
          onClick={() => onToggle && onToggle()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: theme === '2024' ? '#FF69B4' : '#3B82F6',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '2rem',
            fontFamily: themeConfig.typography.primaryFont,
            fontWeight: '600',
            fontSize: '0.875rem',
            cursor: 'pointer',
            boxShadow: theme === '2024' 
              ? '0 8px 25px rgba(255,105,180,0.3)'
              : '0 8px 25px rgba(59,130,246,0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = theme === '2024' 
              ? '0 12px 35px rgba(255,105,180,0.4)'
              : '0 12px 35px rgba(59,130,246,0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0px)';
            e.target.style.boxShadow = theme === '2024' 
              ? '0 8px 25px rgba(255,105,180,0.3)'
              : '0 8px 25px rgba(59,130,246,0.3)';
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
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '420px',
        maxWidth: '90vw',
        backgroundColor: themeConfig.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.98)',
        borderRadius: '1rem',
        boxShadow: themeConfig.isDark 
          ? '0 25px 50px rgba(255, 105, 180, 0.15), 0 10px 20px rgba(0, 0, 0, 0.4)'
          : '0 25px 50px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.05)',
        border: themeConfig.isDark ? '2px solid rgba(255,255,255,0.2)' : '2px solid rgba(0,0,0,0.08)',
        backdropFilter: 'blur(20px)',
        zIndex: 20,
        transition: 'all 0.3s ease',
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.5rem 0.5rem',
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
      <div style={{ padding: '1rem 1.5rem 0.5rem' }}>
        <input
          type="text"
          placeholder="Search camps, addresses, or organizers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
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
            e.target.style.borderColor = theme === '2024' ? '#FF69B4' : '#3B82F6';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = themeConfig.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
          }}
        />
      </div>
      
      {/* Filter Buttons */}
      <div style={{ padding: '0 1.5rem 1rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          {filterOptions.map(option => {
            const IconComponent = option.icon;
            const isSelected = selectedFilter === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => setSelectedFilter(option.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: `2px solid ${isSelected 
                    ? (theme === '2024' ? '#FF69B4' : '#3B82F6')
                    : (themeConfig.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)')
                  }`,
                  borderRadius: '0.5rem',
                  backgroundColor: isSelected
                    ? (theme === '2024' ? 'rgba(255,105,180,0.2)' : 'rgba(59,130,246,0.2)')
                    : 'transparent',
                  color: themeConfig.textColor,
                  fontFamily: themeConfig.typography.primaryFont,
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? '600' : '400',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.target.style.backgroundColor = themeConfig.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <IconComponent size="0.75rem" />
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
              color: theme === '2024' ? '#FF69B4' : '#3B82F6',
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
      
      {/* Results List */}
      {isExpanded && filteredCamps.length > 0 && (
        <div style={{
          maxHeight: '300px',
          overflowY: 'auto',
          borderTop: `1px solid ${themeConfig.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          padding: '1rem 1.5rem'
        }}>
          {filteredCamps.slice(0, 10).map((camp, index) => (
            <div
              key={camp.id}
              onClick={() => onCampSelect && onCampSelect(camp)}
              style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: `1px solid ${themeConfig.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                marginBottom: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = themeConfig.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                fontWeight: '600',
                fontSize: '0.875rem',
                color: themeConfig.textColor,
                fontFamily: themeConfig.typography.primaryFont,
                marginBottom: '0.25rem'
              }}>
                {camp.camp_name}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: themeConfig.textColor,
                opacity: 0.7,
                fontFamily: themeConfig.typography.primaryFont
              }}>
                📍 {camp.placement_address}
              </div>
            </div>
          ))}
          {filteredCamps.length > 10 && (
            <div style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              color: themeConfig.textColor,
              opacity: 0.6,
              fontFamily: themeConfig.typography.primaryFont,
              marginTop: '0.5rem'
            }}>
              Showing first 10 of {filteredCamps.length} results
            </div>
          )}
        </div>
      )}
      
      {/* CSS Animations */}
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
      `}</style>
    </div>
  );
};

export default SearchPanel;