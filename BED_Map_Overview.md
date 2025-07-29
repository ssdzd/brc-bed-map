# BRC B.E.D. Map - Interactive Burning Man Camp Progress Tracker

## 🔥 Overview

The BRC B.E.D. Map is an innovative web application that visualizes the Bureau of Erotic Discourse (B.E.D.) program adoption across Black Rock City theme camps. This interactive map transforms the way the Burning Man community tracks and celebrates consent education progress, making it engaging, accessible, and visually stunning.

## 🎯 Purpose & Impact

The B.E.D. program educates theme camps about consent culture - a cornerstone value at Burning Man. This map serves as both a progress tracker and a motivational tool, encouraging camps to:

- **Register** for the BEDucator training program
- **Implement** unique consent policies within their camps  
- **Schedule** educational BED talks during the event

By gamifying the adoption process with visual feedback and real-time statistics, the map has significantly increased program participation and awareness.

## 🚀 Key Features

### Interactive City Map

- **256 precisely polygonized city blocks** representing the full Black Rock City layout
- **Real-time color coding** showing each block's highest B.E.D. progress level
- **Intuitive click-to-explore** interface revealing camp details per block
- **Custom landmarks** including Airport, Ranger HQ, and Medical stations

### Live Data Integration

- **Airtable API connection** for real-time camp registration updates
- **Intelligent address parsing** converting various formats to block locations
- **Fallback mock data** ensuring functionality during connection issues
- **Automatic data validation** and error handling

### Advanced UI/UX

- **Dual theme system**: Professional 2025 theme and vibrant 2024 Burning Man aesthetic
- **Mobile-responsive design** with touch gesture support
- **Performance monitoring** with Core Web Vitals tracking
- **Accessibility features** including keyboard navigation and ARIA labels

### Camp Discovery Tools

- **Smart search functionality** with real-time filtering
- **Statistical dashboard** showing adoption metrics and completion rates
- **URL state persistence** for shareable map views
- **Camp information panels** with scrollable details

## 🛠️ Technical Architecture

### Frontend Stack

- **React 19.1.0** with modern hooks architecture
- **Vite 6.3.5** for lightning-fast development and builds
- **Tailwind CSS 4.1.10** for responsive, theme-aware styling
- **Direct SVG manipulation** for efficient map rendering

### Data Layer

- **Live Airtable integration** with authentication and pagination
- **Comprehensive mock data generator** for testing and demos
- **Address normalization system** handling multiple input formats
- **Geographic plaza quarter mapping** with intuitive naming

### Data Pipeline

The map receives real-time updates through an automated data pipeline:

- **BEDtalks.org** - Camps register and progress through the BEDucator program on the main website
- **Zapier automation** - Automatically pushes progress updates from BEDtalks.org to Airtable
- **Airtable database** - Serves as the central data repository with camp information and BED status
- **Map API integration** - Fetches latest data from Airtable with intelligent caching

This seamless integration ensures the map always displays current program participation without manual data entry.

### Performance Optimizations

- **React.memo** applied to frequently re-rendering components
- **Bundle size monitoring** with automated analysis
- **Lazy loading strategies** for assets and data
- **Memory leak prevention** with proper cleanup

### Development Excellence

- **Comprehensive JSDoc documentation** for all components
- **PropTypes validation** for runtime type checking
- **Structured logging system** with environment-aware output
- **GitHub Pages deployment** with automated CI/CD

## 🌐 Deployment & Integration

### GitHub Pages Hosting

The B.E.D. Map is deployed using GitHub Pages, providing:

- **Free, reliable hosting** directly from the repository
- **Automated deployment** triggered by commits to the main branch
- **HTTPS by default** ensuring secure connections
- **Global CDN** for fast loading worldwide
- **Custom domain support** for professional presentation

### Live Integration on BEDtalks.org

The map is seamlessly integrated into the official BEDtalks.org website:

- **Live deployment** at [bedtalks.org/live-bed-map](https://bedtalks.org/live-bed-map)
- **iframe embedding** allows full functionality within the parent site
- **Responsive sizing** adapts to the container dimensions
- **Cross-origin communication** enables interaction with the parent page
- **Maintained state** preserves user selections and filters

### Deployment Workflow

```bash
# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy

# Automatic deployment via GitHub Actions on push to main
```

The iframe integration maintains all interactive features while providing a seamless experience within the BEDtalks.org ecosystem, making the map accessible to the broader Burning Man community.

## 📊 Technical Innovations

### Polygon Generation System

Instead of runtime processing, the map uses a sophisticated Python-based polygonizer that:

- Generates precise block geometries from SVG templates
- Optimizes paths for minimal file size
- Validates coverage with visual overlays
- Exports production-ready polygon data

### Smart Address Parsing

The system intelligently handles various address formats:

- Standard format: `"3:45 & C"` or `"C & 3:45"`
- Plaza quarters: `"9:01 & B+"` (geographic naming)
- Malformed inputs: `"3&J"` → `"3:00 & J"`
- Time rounding based on street location (30-min vs 15-min intervals)

### Performance Dashboard

Development mode includes a real-time performance monitor tracking:

- Core Web Vitals (FCP, LCP, CLS)
- Component render times with slow render warnings
- User interaction metrics
- Memory usage monitoring

## 🌟 User Experience Highlights

### Visual Design

- **Gradient-based theming** matching Burning Man's aesthetic
- **Animated status icons** bringing the legend to life
- **Glow effects** for selected blocks and filtered results
- **Smooth transitions** throughout the interface

### Mobile Experience

- **Responsive panels** that adapt to screen size
- **Touch-optimized controls** for zooming and panning
- **Collapsible legend** maximizing map visibility
- **Mobile-specific UI elements** like the update button

### Accessibility

- **WCAG 2.1 AA compliant** color contrast ratios
- **Full keyboard navigation** with intuitive shortcuts
- **Screen reader support** with semantic HTML and ARIA
- **Focus management** respecting user preferences

## 📈 Impact & Results

The B.E.D. Map has transformed program adoption by:

- **Visualizing progress** in an engaging, game-like format
- **Creating social proof** as camps see neighbors participating
- **Reducing friction** with easy camp lookup and status tracking
- **Enabling data-driven decisions** for program coordinators

## 🔮 Future Enhancements

Planned features include:

- Historical progress tracking and year-over-year comparisons
- Camp-to-camp messaging for BEDucator coordination
- Integration with Burning Man's official placement system
- Export functionality for creating print materials

## 🤝 Open Source Contribution

The project demonstrates best practices in:

- Modern React development with hooks and performance optimization
- Accessible, responsive web design
- Real-world API integration with robust error handling
- Creative data visualization for community engagement

---

*The BRC B.E.D. Map showcases how technology can amplify cultural movements, making consent education visible, celebrated, and contagious throughout the Burning Man community.*
