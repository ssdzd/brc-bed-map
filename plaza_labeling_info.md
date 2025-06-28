# Plaza Quarter Labeling System - BRC BED Map

## Overview

The plaza quarter labels (A, B, C, D) in the BRC map follow a **counter-clockwise orientation** relative to the SVG image, with the labeling system varying based on whether the plaza is in standard or rotated orientation.

## Quarter Labeling Convention

Each plaza is divided into 4 quarters labeled A, B, C, D in counter-clockwise order:

```
    B (top-left)     A (top-right)    
         |               |
    C (bottom-left)  D (bottom-right)
```

## Plaza Locations and Their Quarter Systems

### **Standard Orientation (No Rotation)**

#### **1. 3:00 B Plaza** (coordinates: 916.5, 272.04)
- **Quarter A**: Top-right (points toward top-right corner of SVG)
- **Quarter B**: Top-left (points toward top-left corner of SVG)
- **Quarter C**: Bottom-left (points toward bottom-left corner of SVG)
- **Quarter D**: Bottom-right (points toward bottom-right corner of SVG)

#### **2. 3:00 G Plaza** (coordinates: 1063.8, 272.04)
- **Quarter A**: Top-right (points toward top-right corner of SVG)
- **Quarter B**: Top-left (points toward top-left corner of SVG)
- **Quarter C**: Bottom-left (points toward bottom-left corner of SVG)
- **Quarter D**: Bottom-right (points toward bottom-right corner of SVG)

#### **3. 6:00 G Plaza** (coordinates: 622, 715.54)
- **Quarter A**: Top-right (points toward top-right corner of SVG)
- **Quarter B**: Top-left (points toward top-left corner of SVG)
- **Quarter C**: Bottom-left (points toward bottom-left corner of SVG)
- **Quarter D**: Bottom-right (points toward bottom-right corner of SVG)

#### **4. 9:00 G Plaza** (coordinates: 180.2, 272.04)
- **Quarter A**: Top-right (points toward top-right corner of SVG)
- **Quarter B**: Top-left (points toward top-left corner of SVG)
- **Quarter C**: Bottom-left (points toward bottom-left corner of SVG)
- **Quarter D**: Bottom-right (points toward bottom-right corner of SVG)

#### **5. 9:00 B Plaza** (coordinates: 327.5, 272.04)
- **Quarter A**: Top-right (points toward top-right corner of SVG)
- **Quarter B**: Top-left (points toward top-left corner of SVG)
- **Quarter C**: Bottom-left (points toward bottom-left corner of SVG)
- **Quarter D**: Bottom-right (points toward bottom-right corner of SVG)

#### **6. Center Camp** (coordinates: 622.5, 547.8)
- **Quarter A**: Top-right (points toward top-right corner of SVG)
- **Quarter B**: Top-left (points toward top-left corner of SVG)
- **Quarter C**: Bottom-left (points toward bottom-left corner of SVG)
- **Quarter D**: Bottom-right (points toward bottom-right corner of SVG)

### **Rotated Orientation (45° Rotation)**

#### **7. 4:30 G Plaza** (coordinates: 935.5, 585.04) - Rotated 45°
- **Quarter A**: Top (points toward top of SVG)
- **Quarter B**: Left (points toward left side of SVG)
- **Quarter C**: Bottom (points toward bottom of SVG)
- **Quarter D**: Right (points toward right side of SVG)

#### **8. 4:30 B Plaza** (coordinates: 830.5, 480.04) - Rotated 45°
- **Quarter A**: Top (points toward top of SVG)
- **Quarter B**: Left (points toward left side of SVG)
- **Quarter C**: Bottom (points toward bottom of SVG)
- **Quarter D**: Right (points toward right side of SVG)

#### **9. 7:30 G Plaza** (coordinates: 308.3, 584.84) - Rotated 45°
- **Quarter A**: Top (points toward top of SVG)
- **Quarter B**: Left (points toward left side of SVG)
- **Quarter C**: Bottom (points toward bottom of SVG)
- **Quarter D**: Right (points toward right side of SVG)

#### **10. 7:30 B Plaza** (coordinates: 413.5, 480.04) - Rotated 45°
- **Quarter A**: Top (points toward top of SVG)
- **Quarter B**: Left (points toward left side of SVG)
- **Quarter C**: Bottom (points toward bottom of SVG)
- **Quarter D**: Right (points toward right side of SVG)

## Address Format for Plaza Quarters

Camps can be placed in specific plaza quarters using these address formats:

- `"3:00 Plaza"` - General plaza location
- `"3:00 Plaza Quarter A"` - Specific quarter A
- `"3:00 Plaza Quarter B"` - Specific quarter B
- `"3:00 Plaza Quarter C"` - Specific quarter C
- `"3:00 Plaza Quarter D"` - Specific quarter D

## Technical Implementation

In the SVG, each plaza quarter is represented as a separate `<path>` element with the CSS class `plaza-quarter`. The quarters are positioned using circular arcs that create the four sections around the central plaza circle.

Some plazas have a `transform="rotate(45 ...)"` attribute applied to rotate the entire plaza 45 degrees from the standard orientation.

## Summary

- **Standard plazas** (3:00, 6:00, 9:00): Quarters are labeled A, B, C, D in **clockwise order starting from top-right**
- **Rotated plazas** (4:30, 7:30): Quarters are rotated 45° so they point toward the **cardinal directions** (top, left, bottom, right)
- **Center Camp**: Follows the same standard pattern as other non-rotated plazas

The system allows for both general plaza placement (matching any quarter) and specific quarter placement (matching only the designated quarter) when camps are assigned addresses. 