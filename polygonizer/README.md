# BRC Polygonizer

A Python script that generates 256 precise polygonal blocks for the Burning Man city layout using circular arc geometry.

## Overview

This script processes a manually edited SVG file of Burning Man's street layout and creates polygon blocks between intersecting ring roads and radial roads. It generates 96 inner blocks (Esplanade through E ring) and 160 outer blocks (F through J rings) with perfect circular arc geometry.

## Key Features

- **Circular Arc Geometry**: Uses exact circular arcs instead of Bezier approximations for perfect curved boundaries
- **95% Point Reduction**: Reduces polygon complexity from ~80 points to just 4 points per polygon
- **Exception Block Handling**: Special processing for Esplanade 5:30 and 6:00 blocks using Rod's Ring Road arc reconstruction
- **Dual Output**: Generates both standalone polygons and combined validation overlays

## Requirements

### Python Dependencies

Install with: `pip install -r requirements.txt`

- **svgpathtools>=1.6.1** - SVG path parsing and manipulation
- **shapely>=2.0.1** - Geometric operations and polygon calculations  
- **numpy>=1.24.0** - Numerical operations for high-resolution sampling

### Standard Library Dependencies

- `math` - Circular arc calculations
- `xml.etree.ElementTree` - SVG file parsing and generation
- `collections.defaultdict` - Data organization

## Input Requirements

The script requires a specific SVG structure in `your_input_manual_edits.svg`:

### Required SVG Groups

1. **Ring_Roads** - Contains concentric ring paths:
   - Esplanade, A, B, C, D, E (inner rings)
   - F, G, H, I, J (outer rings)

2. **Main_Radial_Roads** - Contains radial street paths:
   - Major radials at 30-minute intervals (2:00, 2:30, 3:00, etc.)

3. **Secondary_Radial_Roads** - Contains secondary radial paths:
   - Minor radials at 15-minute intervals (2:15, 2:45, 3:15, etc.)

### SVG Structure Requirements

- Proper XML namespace formatting
- Ring roads as `<path>` elements with `d` attributes
- Radial roads as `<line>` or `<polyline>` elements
- Group IDs matching expected naming conventions

## Usage

```bash
python clean_brc_polygonizer.py
```

The script will automatically:
1. Parse the input SVG file
2. Detect ring-radial intersections
3. Generate circular arc polygons
4. Create output files

## Output Files

### 1. brc_arc_polygons.svg
- Standalone polygon file with 256 blocks
- Uses circular arc geometry (4 points per polygon)
- Special polyline handling for Esplanade exception blocks
- Color-coded by ring type (inner/outer/exception)

### 2. brc_combined_validation.svg
- Original SVG roads with polygon overlays
- Maintains original SVG styling
- Adds polygon layer for validation
- Proper SVG namespace handling

## Technical Details

### Geometric Approach

- **Center Point**: (622.5, 272.04) - The Man's location
- **Circular Arcs**: Perfect circles with calculated radii for each ring
- **High-Resolution Sampling**: 2000 points for accurate intersection detection
- **Radial Projection**: Ensures perfectly straight radial roads

### Block Generation

- **96 Inner Blocks**: Esplanade through E ring (8 rings × 12 time slots)
- **160 Outer Blocks**: F through J rings (5 rings × 32 time slots including 15-minute intervals)
- **Exception Blocks**: Esplanade_5:30 and Esplanade_6:00 use Rod's Ring Road reconstruction

### Special Features

- **Rod's Ring Road Integration**: Uses A & 6:00 intersection as arc center for exception blocks
- **SVG Namespace Compatibility**: Proper `svg:` prefixes for combined validation
- **Polygon Validation**: Ensures all 256 blocks are successfully generated

## File Structure

```
polygonizer/
├── clean_brc_polygonizer.py      # Main script
├── your_input_manual_edits.svg   # Input SVG file
├── requirements.txt              # Python dependencies
├── brc_arc_polygons.svg          # Generated polygons (output)
├── brc_combined_validation.svg   # Combined validation (output)
└── README.md                     # This file
```

## Notes

- The script is optimized for the specific Burning Man city layout
- Exception blocks handle irregular geometry around the 6:00 corridor
- All measurements are in SVG coordinate units
- Generated polygons maintain perfect adjacency without gaps or overlaps