# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Interactive Burning Man map system for tracking B.E.D. (Bureau of Erotic Discourse) program progress across theme camps in Black Rock City. The system colors city blocks based on camp participation status and allows clicking blocks to see camp details.

## Architecture
- **Frontend**: React with Vite
- **Map Rendering**: React Simple Maps + Paper.js for complex geometric processing
- **State Management**: Zustand
- **Data Layer**: React Query + Airtable API
- **SVG Processing**: Paper.js for block generation from SVG paths

## Key Components Structure
```
src/
├── components/BurningManMap/     # Main map display components
├── utils/
│   ├── svgParser.js             # Extracts rings, radials, landmarks from SVG
│   ├── mapGeometry.js           # Generates clickable blocks from SVG paths
│   ├── addressParser.js         # Parses BRC addresses ("C & 3:45" format)
│   └── bedProgress.js           # BED status color mapping
├── services/airtable.js         # Airtable API integration
└── store/mapStore.js            # Zustand state management
```

## Data Flow
1. SVG parser extracts geometric data from `brc-2025-base.svg`
2. Block generator creates clickable regions from ring/radial intersections  
3. Airtable provides camp data with B.E.D. status and placement addresses
4. Address parser maps camps to blocks using "Street & Time" format
5. Blocks are colored based on highest B.E.D. progress level within each block

## B.E.D. Progress Color System
- **Gray (#9CA3AF)**: No engagement
- **Yellow (#FDE047)**: Video training completed  
- **Orange (#FB923C)**: B.E.D. Buddy assigned
- **Green (#4ADE80)**: Full implementation with policy

## Development Commands
Currently in planning phase - no package.json exists yet. When implemented:
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run preview` - Preview production build

## Critical Implementation Notes
- SVG contains pre-defined blocks with IDs like `A_8`, `B_15` (Street_TimeSegment)
- Camp addresses use format "C & 3:45" (Street & Clock time)
- Block generation uses Paper.js for geometric calculations and intersection finding
- Interactive overlay sits above base SVG for click detection
- Address parsing must handle all BRC address variations accurately

## Airtable Schema
Table: "BED_Camp_Progress"
- camp_name, user_name, email, placement_address
- bed_status (single select): none, video_complete, buddy_assigned, fully_implemented
- buddy_name, last_updated, notes
- Computed fields: block_id, color_hex

## Development Priority
Week 1 focus is on SVG parsing and block generation with Paper.js before adding Airtable integration.

Note: B.E.D. stands for "Bureau of Erotic Discourse" - a program for theme camps at Burning Man.