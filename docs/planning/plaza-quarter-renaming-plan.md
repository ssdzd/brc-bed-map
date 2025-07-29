# Plaza Quarter Renaming Plan

## Current System
Plaza quarters currently use generic A, B, C, D labels that don't indicate their geographic location relative to the clock positions and street intersections.

## New Geographic Naming Convention
Format: `[TIME] & [STREET][DIRECTION]`
- **TIME**: Plaza time ± 1 minute (e.g., 5:59, 6:01, 7:29, 7:31)
- **STREET**: Letter designation (A, B, G)
- **DIRECTION**: `+` (outward/higher letter) or `-` (inward/lower letter)

## Plaza Quarter Orientations
All plaza quarters are labeled A-D counterclockwise, with Quarter A positioned as follows:
- **Center Camp (6:00 & A)**: Quarter A touches 5:30 & A block
- **6:00 & G**: Quarter A touches 5:30 & G block (similar orientation to Center Camp)
- **9:00 & B**: Quarter A touches 8:30 & B block
- **9:00 & G**: Quarter A touches 8:30 & G block (similar orientation to 9:00 & B)
- **7:30 & B**: Quarter A touches 7:00 & B block
- **7:30 & G**: Quarter A touches 7:00 & G block (similar orientation to 7:30 & B)

## Plaza-by-Plaza Examples

### Center Camp: 6:00 & A Plaza
- **Quarter A** → `5:59 & A+` (touches 5:30 & A, toward B street)
- **Quarter B** → `5:59 & A-` (toward Esplanade)
- **Quarter C** → `6:01 & A-` (toward Esplanade)
- **Quarter D** → `6:01 & A+` (toward B street)

### 6:00 & G Plaza
- **Quarter A** → `5:59 & G+` (touches 5:30 & G, toward outer perimeter)
- **Quarter B** → `5:59 & G-` (toward F street)
- **Quarter C** → `6:01 & G-` (toward F street)
- **Quarter D** → `6:01 & G+` (toward outer perimeter)

### 3:00 & B Plaza
- **Quarter A** → `3:01 & B+` (touches 8:30 & B, toward C street)
- **Quarter B** → `2:59 & B+` (toward C street)
- **Quarter C** → `2:59 & B-` (toward A street)
- **Quarter D** → `3:01 & B-` (toward A street)

### 3:00 & G Plaza
- **Quarter A** → `3:01 & G+` (toward outer perimeter)
- **Quarter B** → `2:59 & G+` (toward outer perimeter)
- **Quarter C** → `2:59 & G-` (toward F street)
- **Quarter D** → `3:01 & G-` (toward F street)

### 9:00 & B Plaza
- **Quarter A** → `8:59 & B-` (touches 8:30 & A, toward A street)
- **Quarter B** → `9:01 & B-` (toward A street)
- **Quarter C** → `9:01 & B+` (toward C street)
- **Quarter D** → `8:59 & B+` (touches 8:30 & B, toward C street)

### 9:00 & G Plaza
- **Quarter A** → `8:59 & G-` (touches 8:30 & F, toward F street)
- **Quarter B** → `9:01 & G-` (toward F street)
- **Quarter C** → `9:01 & G+` (toward outer perimeter)
- **Quarter D** → `8:59 & G+` (touches 8:30 & G, toward outer perimeter)

### 7:30 & B Plaza
- **Quarter A** → `7:29 & B+` (touches 7:00 & B, toward C street)
- **Quarter B** → `7:29 & B-` (toward A street)
- **Quarter C** → `7:31 & B-` (toward A street)
- **Quarter D** → `7:31 & B+` (toward C street)

### 7:30 & G Plaza
- **Quarter A** → `7:29 & G+` (touches 7:00 & G, toward outer perimeter)
- **Quarter B** → `7:29 & G-` (toward F street)
- **Quarter C** → `7:31 & G-` (toward F street)
- **Quarter D** → `7:31 & G+` (toward outer perimeter)

### 4:30 & B Plaza
- **Quarter A** → `4:31 & B+` (toward C street)
- **Quarter B** → `4:29 & B+` (touches 4:00 & B, toward C street)
- **Quarter C** → `4:29 & B-` (toward A street)
- **Quarter D** → `4:31 & B-` (toward A street)

### 4:30 & G Plaza
- **Quarter A** → `4:31 & G+` (toward outer perimeter)
- **Quarter B** → `4:29 & G+` (touches 4:00 & G, toward outer perimeter)
- **Quarter C** → `4:29 & G-` (toward F street)
- **Quarter D** → `4:31 & G-` (toward F street)

## Implementation Strategy
1. **Map Quarter IDs**: Find current `polygon_[PLAZA]_[QUARTER]` IDs
2. **Create Conversion Function**: Map old A/B/C/D to new geographic names based on counterclockwise orientation
3. **Update blockUtils.js**: Modify display and parsing functions
4. **Test Each Plaza**: Verify all 10 plazas show correct geographic names

## Logic Rules
- **Counterclockwise Labeling**: A→B→C→D goes counterclockwise around each plaza
- **Time Calculation**: Plaza time ± 1 minute (e.g., 6:00 becomes 5:59/6:01, 7:30 becomes 7:29/7:31)
- **Street Direction**:
  - `+` = toward higher/outer street letters (toward perimeter)
  - `-` = toward lower/inner street letters (toward center)

The system makes each quarter immediately understandable by its geographic relationship to nearby street intersections and clock positions.