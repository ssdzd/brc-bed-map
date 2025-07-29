# Data Directory

This directory contains data files used by the BRC BED Map application.

## Files

- **polygon_address_mappings.csv** - Mapping between polygon IDs and Black Rock City addresses
  - Format: `polygon_id,street,time,address`
  - Used for converting between internal polygon IDs and human-readable addresses

## Usage

The CSV file is used by the address parsing logic to map between:
- SVG polygon IDs (e.g., `polygon_A_3:00`)
- Display addresses (e.g., `A & 3:00`)

This data is essential for the interactive map functionality and camp location mapping.