# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Interactive Burning Man map system for tracking B.E.D. (Bureau of Erotic Discourse) program progress across theme camps in Black Rock City. The system colors city blocks based on camp participation status and allows clicking blocks to see camp details.

**Current Status**: Fully functional web application with comprehensive UI, ready for production data integration.

## Architecture
- **Frontend**: React 19.1.0 with Vite 6.3.5
- **Styling**: Tailwind CSS 4.1.10 with dual theme system
- **Map Rendering**: Direct SVG manipulation with interactive overlays
- **State Management**: React hooks with URL state persistence
- **Data Layer**: Mock data structure ready for Airtable API integration
- **Deployment**: GitHub Pages with automated deployment

## Current Implementation Structure
```
app/src/
├── components/              # 17 interactive components
│   ├── MapView.jsx         # Main map container with zoom/pan
│   ├── BEDmapHeader.jsx    # Theme-aware header component
│   ├── Legend.jsx          # BED status legend with tooltips
│   ├── InfoPanel.jsx       # Block details with camp information
│   ├── SearchPanel.jsx     # Camp search with filtering
│   ├── StatsPanel.jsx      # Progress statistics and metrics
│   ├── SharePanel.jsx      # URL sharing functionality
│   ├── PlayaIcons/         # Custom SVG icon components
│   └── [10 more UI components]
├── hooks/
│   ├── useMapData.js       # Data fetching (currently mock data)
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
3. Mock data provides camp information with B.E.D. status (ready for Airtable)
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
- **Error Boundaries**: Graceful handling of component failures

## Ready for Production Integration
**Implemented and Working**:
- Complete UI/UX with all interactive features
- Comprehensive component library
- Dual theme system with persistence
- Mock data structure matching Airtable schema
- GitHub Pages deployment pipeline
- Responsive design for all screen sizes

**Next Steps for Production**:
- Replace mock data in `useMapData.js` with Airtable API calls
- Implement proper address parsing for "C & 3:45" format to block mapping
- Add error handling for API failures and data validation
- Implement proper loading states and error boundaries
- Add analytics and performance monitoring

## Airtable Integration Schema
Table: "BED_Camp_Progress" (ready for integration)
- camp_name, placement_address, bed_status
- Status values: "none", "registered", "consent_policy", "bed_talk"
- Mock data structure in `useMapData.js` matches expected schema

Note: B.E.D. stands for "Bureau of Erotic Discourse" - a program for theme camps at Burning Man.

## Git Workflow Instructions for Claude Code
When making changes to files:
1. Always commit changes after user approval with descriptive commit messages
2. Include the standard Claude Code footer in all commits
3. Use conventional commit format: `feat:`, `fix:`, `refactor:`, etc.
4. Run any available linting/validation before committing
5. Never commit without explicit user approval