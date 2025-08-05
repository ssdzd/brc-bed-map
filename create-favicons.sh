#!/bin/bash

# Script to create favicon sizes using sips
# Usage: ./create-favicons.sh input-image.png

if [ $# -eq 0 ]; then
    echo "Usage: $0 <input-image.png>"
    exit 1
fi

INPUT_IMAGE="$1"
OUTPUT_DIR="app/public"

# Check if input file exists
if [ ! -f "$INPUT_IMAGE" ]; then
    echo "Error: Input file '$INPUT_IMAGE' not found"
    exit 1
fi

echo "Creating favicons from $INPUT_IMAGE..."

# Create 16x16 favicon
sips -z 16 16 "$INPUT_IMAGE" --out "$OUTPUT_DIR/favicon-16x16.png"
echo "Created favicon-16x16.png"

# Create 32x32 favicon
sips -z 32 32 "$INPUT_IMAGE" --out "$OUTPUT_DIR/favicon-32x32.png"
echo "Created favicon-32x32.png"

# Create 180x180 Apple touch icon
sips -z 180 180 "$INPUT_IMAGE" --out "$OUTPUT_DIR/apple-touch-icon.png"
echo "Created apple-touch-icon.png"

# Create a copy for the .ico file (we'll use the 32x32 as base)
cp "$OUTPUT_DIR/favicon-32x32.png" "$OUTPUT_DIR/favicon.ico"
echo "Created favicon.ico (copy of 32x32)"

echo "All favicons created successfully in $OUTPUT_DIR/"
echo ""
echo "Note: For a proper multi-resolution .ico file, you may want to use:"
echo "  - ImageMagick: convert favicon-16x16.png favicon-32x32.png favicon.ico"
echo "  - Or an online tool like favicon.io"