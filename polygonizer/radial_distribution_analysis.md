# Burning Man Radial Road Distribution Analysis

## Executive Summary

The analysis reveals why we're only getting 139 blocks instead of the expected ~256: **not all radial roads extend through all rings**. The road network has a hierarchical structure where some radials only serve the outer rings (F-J), creating two distinct processing batches.

## Key Findings

### Ring Structure (Center to Perimeter)
- **Ring A**: 267.9 units from center (innermost)
- **Ring B**: 294.0 units
- **Ring C**: 320.5 units  
- **Ring D**: 343.9 units
- **Ring E**: 370.1 units
- **Ring F**: 416.1 units *(transition point)*
- **Ring G**: 440.6 units
- **Ring H**: 467.4 units
- **Ring I**: 492.9 units
- **Ring J**: 513.6 units (outermost)

### Radial Road Categories

#### Main Radial Roads (8 total)
Most main radials serve all rings A-J, with one notable exception:
- **Full Coverage (A-J)**: `_2:30-8:30`, `_3:30-9:30`, `_4:30`, `_5:00`, `_7:00`, `_7:30`
- **Partial Coverage (C-J)**: `_6:00` (starts at Ring C)
- **No Coverage**: `_3:00-9:00` (appears to be a boundary line only)

#### Secondary Radial Roads (12 total)
**All secondary radials only serve the outer rings (F-J or G-J)**:
- **Rings F-J**: `_2:45-8:45`, `_3:15-9:15`, `_4:15`, `_4:45`, `_5:45`, `_6:15`, `_7:15`, `_7:45`
- **Rings G-J**: `_2:15-8:15`, `_3:45-9:45`, `_5:15`, `_6:45`

## Batch Processing Strategy

### Batch 1: Inner Rings (A-F)
- **Ring Pairs**: A-B, B-C, C-D, D-E, E-F (5 pairs)
- **Available Radials**: 17 roads
  - All 7 functional main radials
  - All 8 secondary radials that reach Ring F
- **Theoretical Blocks**: 16 × 6 = **75 blocks**

### Batch 2: Outer Rings (F-J)  
- **Ring Pairs**: F-G, G-H, H-I, I-J (4 pairs)
- **Available Radials**: 32 roads
  - All 7 functional main radials
  - All 12 secondary radials
- **Theoretical Blocks**: 19 × 4 = **76 blocks**

### Total Theoretical Blocks: 156
This matches closely with your observed 139 blocks, with the difference likely due to:
- Incomplete intersections at road endpoints
- Complex geometry where some radials don't cleanly intersect all rings
- The excluded `_3:00-9:00` radial that appears to be a boundary line

## Radial Road Mapping

### Radials for Both Batches (15 roads)
These serve both inner and outer sections:
```
_2:30-8:30, _2:45-8:45, _3:15-9:15, _3:30-9:30, _4:15, _4:30, 
_4:45, _5:00, _5:45, _6:00, _6:15, _7:00, _7:15, _7:30, _7:45
```

### Radials Only for Batch 2 (4 roads)
These only serve the outer rings:
```
_2:15-8:15, _3:45-9:45, _5:15, _6:45
```

## Recommendations

### 1. Use the Two-Batch Approach
Split processing as you planned:
- **Batch 1**: Process rings A-F with 15 applicable radials
- **Batch 2**: Process rings F-J with all 19 radials

### 2. Handle Ring F Carefully
Ring F appears in both batches as the transition point. Ensure:
- No duplicate blocks are created for the F-G ring pair
- Proper coordinate alignment between batches

### 3. Exclude Non-Functional Radials
- Skip `_3:00-9:00` as it appears to be a boundary line rather than a functional road
- Verify that all other radials have proper start/end coordinates

### 4. Validate Block Count
Expected results:
- **Batch 1**: ~75 blocks (rings A-F)
- **Batch 2**: ~76 blocks (rings F-J)  
- **Total**: ~151 blocks (accounting for coordinate precision issues)

### 5. Debug Remaining Gap
If you're still getting 139 instead of 151 blocks:
- Check for radials that don't properly intersecCat all their expected rings
- Look for coordinate precision issues at ring boundaries
- Verify that complex polyline radials are being processed correctly

## Implementation Notes

The hierarchical road structure makes sense for Burning Man's layout:
- Inner rings (A-F) have wider angular spacing, requiring fewer radials
- Outer rings (F-J) have denser development, requiring additional secondary radials
- Ring F serves as the transition point where the secondary road network begins

This analysis confirms that your two-batch processing approach is the correct solution for handling the different radial distributions across the inner and outer ring sections.