import React, { useState, useEffect } from 'react';
import { THEMES } from '../utils/blockUtils';
import { PlayaIcons } from './PlayaIcons';

const SearchPanel = ({ 
  camps, 
  theme = '2025', 
  onCampSelect, 
  onFilterChange,
  onFilterButtonClick,
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
    { value: 'none', label: 'Not Registered', icon: PlayaIcons.Camp },
    { value: 'registered', label: 'Started BEDucator program', icon: PlayaIcons.VideoPlay },
    { value: 'consent_policy', label: 'Distributed Consent Policy', icon: PlayaIcons.Buddy },
    { value: 'bed_talk', label: 'Scheduled BED talk', icon: PlayaIcons.CheckMark }
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
            e.target.style.borderColor = theme === '2024' ? '#FF69B4' : '#3B82F6';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = themeConfig.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)';
          }}
        />
      </div>
      
      {/* Filter Buttons */}
      <div style={{ padding: '0 1rem 0.5rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
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
                  setSelectedFilter(option.value);
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
                {/* Color indicator dot for non-'all' options */}
                {option.value !== 'all' && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: statusColor,
                    marginRight: '0.25rem'
                  }} />
                )}
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
          maxHeight: '150px',
          overflowY: 'auto',
          borderTop: `1px solid ${themeConfig.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          padding: '0.75rem 1.25rem'
        }}>
          {filteredCamps.slice(0, 10).map((camp, index) => (
            <div
              key={camp.id}
              onClick={() => onCampSelect && onCampSelect(camp)}
              style={{
                padding: '0.5rem',
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