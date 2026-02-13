#!/bin/bash

# Migration script for adding user profile features
# This script will run the Prisma migration and install required dependencies

echo "🚀 Starting migration for user profile features..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found. Please run 'npm install' first."
    exit 1
fi

# Install @headlessui/react if not already installed
echo "📦 Installing @headlessui/react..."
npm install @headlessui/react

# Run Prisma migration
echo ""
echo "🗄️  Running database migration..."
npx prisma migrate dev --name add_profile_and_categories

# Generate Prisma client
echo ""
echo "⚙️  Generating Prisma client..."
npx prisma generate

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Log in to your account"
echo "3. Click on your user avatar in the navigation"
echo "4. Click 'Generate Avatar' to create your profile image using AI"
echo ""
echo "Note: Make sure you have added your OpenAI API key in the admin dashboard"
echo "      under the AI Settings section before generating profile images."
