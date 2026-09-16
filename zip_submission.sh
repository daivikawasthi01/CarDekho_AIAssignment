#!/bin/bash

# Script to zip submission excluding node_modules, build folders, and temp files.

OUTPUT_ZIP="CarDekho_Grocery_Compare.zip"

echo "📦 Packaging submission into ${OUTPUT_ZIP}..."

# Remove previous zip if exists
rm -f "${OUTPUT_ZIP}"

# Create zip archive
zip -r "${OUTPUT_ZIP}" . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x ".DS_Store" \
  -x "*.log" \
  -x "scratch/*" \
  -x "dist/*" \
  -x "build/*"

echo "✅ Package created successfully: ${OUTPUT_ZIP}"
echo "File size:"
du -h "${OUTPUT_ZIP}"
