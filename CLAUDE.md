# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Interactive Burning Man map system for tracking B.E.D. (Bureau of Erotic Discourse) program progress across theme camps in Black Rock City. The system colors city blocks based on camp participation status and allows clicking blocks to see camp details.

**Current Status**: Production-ready web application with live Airtable data integration and comprehensive UI.

## Architecture
- **Frontend**: React 19.1.0 with Vite 6.3.5
- **Styling**: Tailwind CSS 4.1.10 with dual theme system
- **Map Rendering**: Direct SVG manipulation with interactive overlays
- **State Management**: React hooks with URL state persistence
- **Data Layer**: Live Airtable API integration with fallback mock data
- **Deployment**: GitHub Pages with automated deployment

## Current Implementation Structure
```
app/src/
├── components/              # 19 interactive components
│   ├── MapView.jsx         # Main map container with zoom/pan
│   ├── BEDmapHeader.jsx    # Theme-aware header component
│   ├── Legend.jsx          # BED status legend with tooltips
│   ├── InfoPanel.jsx       # Block details with camp information
│   ├── SearchPanel.jsx     # Camp search with filtering
│   ├── StatsPanel.jsx      # Progress statistics and metrics
│   ├── SharePanel.jsx      # URL sharing functionality
│   ├── PlayaIcons.jsx      # Custom SVG icon components with animations
│   ├── ErrorBoundary.jsx   # Error handling and fallback UI
│   ├── LoadingSpinner.jsx  # Loading state component
│   ├── ErrorDisplay.jsx    # Error state component
│   ├── Tooltip.jsx         # Interactive tooltip system
│   ├── ZoomControls.jsx    # Map zoom and pan controls
│   ├── ThemeSwitcher.jsx   # Theme toggle functionality
│   ├── DataSourceSelector.jsx # Data source switching
│   ├── CentralLogo.jsx     # B.E.D. logo and branding
│   ├── BackgroundOverlay.jsx # Theme background styling
│   ├── CornerCharacters.jsx # Decorative corner elements
│   └── UpdatePanel.jsx     # Data update integration
├── hooks/
│   ├── useMapData.js       # Live Airtable API data fetching with mock fallback
│   └── useUrlState.js      # URL state management and sharing
├── utils/
│   └── blockUtils.js       # Block coloring and theme utilities
└── test/                   # Comprehensive testing suite
    ├── components/         # Component unit tests
    ├── hooks/              # Hook unit tests
    ├── utils/              # Utility function tests
    ├── integration/        # Integration tests
    ├── e2e/                # End-to-end tests
    └── setup.js            # Test configuration
```

## Polygon Generation System
Uses external Python polygonizer tool instead of runtime processing:
```
polygonizer/
├── polygonizer.py          # Generates precise block geometries
├── requirements.txt        # Dependencies (geopandas, shapely, etc.)
├── brc_base_clean.svg     # Input template for manual edits
└── output/                # Generated polygon files
    ├── brc_polygons.svg   # 256 optimized polygonal blocks
    └── validation files   # Visual verification overlays
```

## Data Flow
1. Python polygonizer generates precise block geometries from SVG template
2. React app loads merged SVG map with pre-generated polygon overlays
3. Live Airtable API provides camp information with B.E.D. status (with mock fallback)
4. Block coloring applies based on highest B.E.D. progress level per block
5. Interactive overlays handle click/hover events with visual feedback

## B.E.D. Progress Color System
- **Gray (#9CA3AF)**: None - no program engagement
- **Orange (#FE8803)**: Registered - signed up for program
- **Purple (#9807AB)**: Consent Policy - policy implemented
- **Hot Pink (#FF1493)**: BED Talk - full program with presentation

## Development Commands
Fully operational development environment:
- `npm run dev` - Start development server at http://localhost:5173
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run deploy` - Deploy to GitHub Pages
- `npm run lint` - Run ESLint code quality checks
- `npm run analyze` - Build and analyze bundle size with recommendations
- `npm run analyze:size` - Analyze existing build bundle size

## Theme System
Dual theme support with complete styling:
- **2025 Professional**: Clean, modern design with muted colors
- **2024 Vibrant**: Bright, colorful Burning Man aesthetic
- Theme persistence in URL state and localStorage

## Critical Implementation Features
- **Block Interaction**: Click/hover with tooltips and visual feedback
- **Zoom/Pan Controls**: Mouse wheel zoom, drag to pan, reset controls
- **Search Functionality**: Real-time camp search with highlighting
- **URL State Management**: Shareable URLs preserve map state and selections
- **Responsive Design**: Mobile-friendly with touch gesture support
- **Statistics Panel**: Real-time progress tracking and camp metrics
- **Geographic Plaza Naming**: Intuitive plaza quarter names based on clock positions
- **Landmark Styling**: Custom styling for Airport, Ranger HQ, and Medical stations
- **Update Integration**: Direct link to camp data update form
- **Dual Theme Support**: Professional 2025 and vibrant 2024 themes
- **Loading States**: Comprehensive loading and error handling

## Recent Major Achievements
- **Live Airtable Integration**: Successfully implemented real-time data sync with fallback support
- **Geographic Plaza Naming**: Developed intuitive naming system for plaza quarters (e.g., "5:59 & A+", "7:29 & G-")
- **Airport Landmark Styling**: Custom Nimue airplane silhouette with gradient effects
- **Mobile Responsiveness**: Comprehensive mobile UI with touch gestures and responsive panels
- **Panel Layer Management**: Fixed z-index issues ensuring proper UI layering
- **Update Button Integration**: Direct link to camp data update form with responsive positioning
- **Address Parsing System**: Complete parsing for "C & 3:45" format including plaza quarters
- **Visual Polish**: Enhanced 2025 theme with improved shadows, contrast, and separation

## Production Status
**Fully Implemented**:
- Complete UI/UX with all interactive features
- Live Airtable API integration with mock data fallback
- Comprehensive component library (19 interactive components)
- Dual theme system with persistence
- Geographic address parsing including plaza quarters
- GitHub Pages deployment pipeline
- Responsive design for all screen sizes
- Loading states and error handling
- Camp search and filtering functionality
- Statistics and sharing panels

**Production Ready**: The application is fully functional and ready for live deployment with real camp data.

## Performance Monitoring & Optimization

### Performance Monitoring System
- **usePerformanceMonitor Hook**: Real-time performance tracking with Core Web Vitals
- **Performance Dashboard**: Development-only dashboard showing live metrics (⚡ button in dev mode)
- **Automatic Tracking**: Page load, component renders, user interactions, and BED-specific operations
- **GitHub Pages Compatible**: Works in production with configurable sampling and logging

### Key Metrics Tracked
- **Core Web Vitals**: First Contentful Paint (FCP), Largest Contentful Paint (LCP), Page Load Time
- **Memory Usage**: JavaScript heap size monitoring (when available)
- **BED Map Specific**: Map load time, SVG load time, data fetch performance
- **Component Performance**: Render times for all components with slow render warnings
- **User Interactions**: Click tracking, performance impact measurement

### Performance Optimizations Implemented
- **React.memo**: Applied to frequently re-rendering components (Legend, InfoPanel, Tooltip)
- **Bundle Analysis**: Automated bundle size monitoring with `npm run analyze`
- **Lazy Loading**: SVG and data loading optimizations
- **Efficient State Management**: URL state persistence without performance impact
- **Memory Management**: Proper cleanup of event listeners and observers

### Bundle Size Monitoring
- **Performance Budget**: JavaScript <500KB, CSS <100KB, Total <1MB
- **Automated Analysis**: Run `npm run analyze` for detailed bundle breakdown
- **Optimization Recommendations**: Automatic suggestions for code splitting and compression
- **GitHub Pages Optimized**: Considers GitHub Pages gzip compression automatically

### Performance Dashboard Features (Development Mode)
- **Real-time Metrics**: Live performance score and detailed breakdowns
- **Component Monitoring**: Render time tracking for all components
- **User Action History**: Recent interactions with performance impact
- **Export Functionality**: JSON export for detailed analysis
- **Configurable Position**: Moveable dashboard (bottom-left by default)

### Production Performance Features
- **Sampling Control**: Configurable performance tracking sampling rate
- **Error Boundaries**: Comprehensive error handling with fallback UI
- **Memory Leak Prevention**: Automatic cleanup of performance observers
- **GitHub Pages Integration**: Optimized for static hosting performance

## Code Quality & Accessibility

### Documentation & Type Safety
- **Comprehensive JSDoc**: All components and hooks documented with parameter types and descriptions
- **PropTypes Validation**: Runtime prop validation for Legend, InfoPanel, PerformanceDashboard
- **TypeScript Support**: Ready for TypeScript migration with proper prop interfaces
- **Component Display Names**: All memoized components have proper display names for debugging

### Accessibility Features (WCAG 2.1 AA Compliant)
- **ARIA Labels**: Semantic labels for all interactive controls and map regions
- **Keyboard Navigation**: Full keyboard support for all map functions
  - `Ctrl/Cmd + +/-` for zoom in/out
  - `Ctrl/Cmd + 0` for reset zoom and pan  
  - `Ctrl/Cmd + F` to open search panel
  - `Escape` to close all panels
- **Screen Reader Support**: Proper roles, labels, and semantic structure
- **Focus Management**: Keyboard navigation respects form inputs and maintains logical tab order
- **High Contrast Support**: Theme system ensures adequate color contrast ratios

### Logging & Debugging System
- **Structured Logging**: Context-aware logging with categories (Map, Data, UI, Performance, Error)
- **Environment-Aware**: Full debugging in development, minimal logging in production
- **Performance Tracking**: Automatic warnings for slow operations (>100ms render times)
- **User Action Logging**: Track interactions with performance impact measurement
- **Global Error Handling**: Unhandled promise rejections and JavaScript errors captured
- **Visual Debugging**: Color-coded console output with emojis for quick identification

### Performance Optimizations
- **React.memo**: Applied to frequently re-rendering components (Legend, InfoPanel, Tooltip, SearchPanel, ZoomControls)
- **Bundle Analysis**: Automated size monitoring with performance budget enforcement
- **Lazy Loading**: Efficient data and asset loading strategies
- **Memory Management**: Proper cleanup of event listeners, observers, and performance trackers
- **Component Render Tracking**: Real-time monitoring of render performance in development

## Airtable Integration Schema
Table: "BED_Camp_Progress" (live integration active)
- camp_name, placement_address, bed_status
- Status values: "none", "registered", "consent_policy", "bed_talk"
- Live API integration in `useMapData.js` with mock data fallback

Note: B.E.D. stands for "Bureau of Erotic Discourse" - a program for theme camps at Burning Man.

## Development Todos

### High Priority
- **Integrate Airtable API for live data sync** ✅ *Completed*
- **Implement address parsing from 'C & 3:45' format to block_id (including plaza quarters)** ✅ *Completed*

### Medium Priority
- **Fix hover tooltip positions for blocks** ✅ *Completed*
- **Fix CSS glow effect clipping at bottom of container** ✅ *Completed*
- **Update copy for BRC Airport info panel popup** ✅ *Completed*
- **Handle BED status labels from Airtable for plaza quarters and airport** ✅ *Completed*
- **Audit interactive components count and clean up artifacts** ✅ *Completed* - Verified all 19 components are actively used and properly documented
- **Add performance monitoring and metrics** ✅ *Completed* - Comprehensive performance monitoring system implemented with dashboard
- **Optimize performance for large camp datasets** ✅ *Completed* - React.memo optimizations and performance monitoring implemented
- **Add proper error boundaries and fallback UI components** ✅ *Completed* - ErrorBoundary.jsx implemented and integrated in App.jsx
- **Add comprehensive testing suite (unit, integration, e2e)** ✅ *Completed* - Full test suite exists with component, hook, util, integration, and e2e tests
- **Style Airport block as a unique landmark** ✅ *Completed*
- **Rename plaza quarters with geographically intuitive names** ✅ *Completed*
- **Fix the selection highlight for unregistered blocks** ✅ *Completed*
- **Add 'Update the BEDmap' button** ✅ *Completed*
- **Add Ranger HQ, Medical icons, and Airport block** ✅ *Completed*
- **Enhance mobile responsiveness with improved scaling and positioning** ✅ *Completed*
- **Make map sizing more robust and resistant to CSS changes** ✅ *Completed*
- **Add invisible balancing element to fix SVG centering issue** ✅ *Completed*
- **Polish the 2025 theme visuals (shadows, contrast, separation)** ✅ *Completed*
- **Polish Search & Filter panel layout and spacing** ✅ *Completed*
- **Clean up Legend Text by shortening labels** ✅ *Completed*
- **Add loading and error states during data fetch** ✅ *Completed*
- **Fix selected block highlight overlapping on hover** ✅ *Completed*

### Low Priority  
- **Add accessibility labels to all interactive map regions** ✅ *Completed* - ARIA labels, keyboard navigation, and screen reader support implemented
- **Create 'Export to Figma/Canva' button with map overlay**
- **Add debug mode toggle to show hidden developer tools** ✅ *Completed* - Performance dashboard with developer tools implemented
- **Implement analytics and performance monitoring** ✅ *Completed* - Comprehensive performance monitoring system with real-time metrics
- **Fix missing block highlight when camp is searched** ✅ *Completed*

## Git Workflow Instructions for Claude Code
When making changes to files:
1. Always commit changes after user approval with descriptive commit messages
2. Include the standard Claude Code footer in all commits
3. Use conventional commit format: `feat:`, `fix:`, `refactor:`, etc.
4. Run any available linting/validation before committing
5. Never commit without explicit user approval