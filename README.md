# BRC BED Map

An interactive Burning Man map that tracks BED (Bureau of Erotic Discourse) program progress. The map colors city blocks based on camp participation status and allows clicking blocks to see camp details.

## Features

- Interactive SVG map of Burning Man city blocks
- Color-coded blocks based on BED program status
- Click blocks to view camp details
- Legend showing status colors
- Mock data for initial testing
- Planned Airtable integration for Week 2

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Project Structure

```
src/
├── components/
│   ├── MapView.jsx         # Main map display
│   ├── InfoPanel.jsx       # Selected block details
│   └── Legend.jsx          # Color legend
├── hooks/
│   └── useMapData.js       # Data fetching logic
├── utils/
│   └── blockUtils.js       # Block/camp matching logic
└── App.jsx                 # Main app
```

## Week 1 Success Criteria

- [x] SVG loads and displays
- [x] Blocks are colored based on mock data
- [x] Clicking a block highlights it
- [x] Info panel shows camp details
- [x] Legend shows color meanings

## Week 2 Additions

- [ ] Connect to Airtable API
- [ ] Add camp creation/editing
- [ ] Implement real address parsing
- [ ] Add search functionality
- [ ] Export colored map as SVG 