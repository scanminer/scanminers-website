#!/usr/bin/env bash
# Setup script for Scanminers Leads D1 Database

set -euo pipefail

echo "🗄️  Scanminers Leads Database Setup"
echo "===================================="
echo ""

DB_NAME="${DB_NAME:-scanminers-leads-v2}"
MIGRATIONS_DIR="database/migrations"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: wrangler CLI not found"
    echo "Install it with: npm install -g wrangler"
    exit 1
fi

# Check if migrations directory exists
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "❌ Error: Migrations directory not found at $MIGRATIONS_DIR"
    exit 1
fi

echo "📋 Step 1: Ensure D1 database exists"
echo "----------------------------------------------------"
echo "Run this command if you still need to create the database:"
echo "  wrangler d1 create $DB_NAME"
read -p "Have you created the database and updated wrangler.toml? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⏸️  Exiting. Please create the database first."
    exit 0
fi

echo ""
echo "📋 Step 2: Apply migrations locally"
echo "----------------------------------------------------"
wrangler d1 migrations apply "$DB_NAME" --local
echo "✅ Local database synchronized with $MIGRATIONS_DIR"

echo ""
echo "📋 Step 3: Apply migrations to remote database (optional)"
echo "----------------------------------------------------"
read -p "Apply migrations to remote database $DB_NAME? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    wrangler d1 migrations apply "$DB_NAME" --remote
    echo "✅ Remote database synchronized with $MIGRATIONS_DIR"
else
    echo "⏭️  Skipped remote migration"
    echo "To apply later, run:"
    echo "  wrangler d1 migrations apply $DB_NAME --remote"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start local dev: npm run dev"
echo "2. Test lead creation at http://localhost:3000/contact"
echo "3. View leads at http://localhost:3000/admin/leads"
echo ""
echo "To query the database:"
echo "  wrangler d1 execute $DB_NAME --local --command='SELECT * FROM leads'"
echo ""
