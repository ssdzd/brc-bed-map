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
│   ├── PlayaIcons/         # Custom SVG icon components
│   └── [12 more UI components]
├── hooks/
│   ├── useMapData.js       # Live Airtable API data fetching with mock fallback
│   └── useUrlState.js      # URL state management and sharing
└── utils/
    └── blockUtils.js       # Block coloring and theme utilities
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
- **Update copy for BRC Airport info panel popup** ✅ *Completed*
- **Handle BED status labels from Airtable for plaza quarters and airport** ✅ *Completed*
- **Audit interactive components count and clean up artifacts** - Check actual number of components, remove old non-existent component references (keep hidden ones)
- **Add performance monitoring and metrics** - Document performance optimizations and add monitoring
- **Optimize performance for large camp datasets**
- **Add proper error boundaries and fallback UI components**
- **Add comprehensive testing suite (unit, integration, e2e)**
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
- **Add accessibility labels to all interactive map regions**
- **Create 'Export to Figma/Canva' button with map overlay**
- **Add debug mode toggle to show hidden developer tools**
- **Implement analytics and performance monitoring**
- **Fix missing block highlight when camp is searched** ✅ *Completed*

## Git Workflow Instructions for Claude Code
When making changes to files:
1. Always commit changes after user approval with descriptive commit messages
2. Include the standard Claude Code footer in all commits
3. Use conventional commit format: `feat:`, `fix:`, `refactor:`, etc.
4. Run any available linting/validation before committing
5. Never commit without explicit user approval