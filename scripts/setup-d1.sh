#!/bin/bash
# Setup script for Scanminers Leads D1 Database

set -e

echo "🗄️  Scanminers Leads Database Setup"
echo "===================================="
echo ""

DB_NAME="scanminers-leads"
MIGRATION_FILE="database/migrations/0001_init_leads.sql"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: wrangler CLI not found"
    echo "Install it with: npm install -g wrangler"
    exit 1
fi

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found at $MIGRATION_FILE"
    exit 1
fi

echo "📋 Step 1: Create D1 database (if it doesn't exist)"
echo "----------------------------------------------------"
echo "Run this command to create the database:"
echo ""
echo "  wrangler d1 create $DB_NAME"
echo ""
echo "After creating, copy the database_id from the output and update wrangler.toml"
echo ""
read -p "Have you created the database and updated wrangler.toml? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⏸️  Exiting. Please create the database first."
    exit 0
fi

echo ""
echo "📋 Step 2: Run migrations locally"
echo "----------------------------------------------------"
wrangler d1 execute $DB_NAME --local --file=$MIGRATION_FILE
echo "✅ Local database initialized"

echo ""
echo "📋 Step 3: Run migrations in production (optional)"
echo "----------------------------------------------------"
read -p "Apply migrations to production database? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    wrangler d1 execute $DB_NAME --remote --file=$MIGRATION_FILE
    echo "✅ Production database initialized"
else
    echo "⏭️  Skipped production migration"
    echo "To apply later, run:"
    echo "  wrangler d1 execute $DB_NAME --remote --file=$MIGRATION_FILE"
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
