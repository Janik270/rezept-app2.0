#!/bin/bash

# Start the development server with proper PATH
# This ensures Node.js is available for Turbopack's spawned processes

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Add node_env/bin to PATH
export PATH="$SCRIPT_DIR/node_env/bin:$PATH"

# Verify node is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js not found in PATH"
    exit 1
fi

echo "Starting development server..."
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo ""

# Start the Next.js development server
cd "$SCRIPT_DIR"
node ./node_modules/.bin/next dev

