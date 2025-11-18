#!/bin/bash

# Build script for CRM Webinar & Training Application
# This script builds executable packages for macOS and Windows

set -e

echo "=================================="
echo "CRM Application Build Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node and npm are installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js version: $(node --version)${NC}"
echo -e "${GREEN}✓ npm version: $(npm --version)${NC}"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf dist/
echo -e "${GREEN}✓ Clean complete${NC}"
echo ""

# Build for macOS
echo "=================================="
echo "Building for macOS..."
echo "=================================="
npm run build:mac

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ macOS build completed successfully${NC}"
    echo ""
    echo "Output files:"
    find dist -name "*.dmg" -o -name "*.zip" | while read file; do
        size=$(du -h "$file" | cut -f1)
        echo "  - $file ($size)"
    done
else
    echo -e "${RED}✗ macOS build failed${NC}"
fi

echo ""

# Build for Windows
echo "=================================="
echo "Building for Windows..."
echo "=================================="
npm run build:win

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Windows build completed successfully${NC}"
    echo ""
    echo "Output files:"
    find dist -name "*.exe" | while read file; do
        size=$(du -h "$file" | cut -f1)
        echo "  - $file ($size)"
    done
else
    echo -e "${RED}✗ Windows build failed${NC}"
fi

echo ""
echo "=================================="
echo "Build Summary"
echo "=================================="
echo ""

if [ -d "dist" ]; then
    echo "All build artifacts are in the 'dist' folder:"
    ls -lh dist/
    echo ""
    echo -e "${GREEN}Build process completed!${NC}"
    echo ""
    echo "Installation packages:"
    echo "  macOS: dist/*.dmg (drag to Applications folder)"
    echo "  Windows: dist/*.exe (run installer)"
else
    echo -e "${RED}No build artifacts found${NC}"
fi
