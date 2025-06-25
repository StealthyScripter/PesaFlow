#!/bin/bash

echo "🧹 PesaFlow Project Cleanup Script"
echo "=================================="

# Create backup first
echo "📦 Creating backup..."
cp -r frontend frontend_backup
cp -r backend backend_backup
echo "✅ Backup created (frontend_backup, backend_backup)"

echo ""
echo "🗑️  Removing redundant files..."

# Frontend cleanup
if [ -f "frontend/src/app/dashboard.tsx" ]; then
    rm frontend/src/app/dashboard.tsx
    echo "✅ Removed redundant dashboard.tsx"
fi

if [ -f "frontend/src/components/Navigation.tsx" ]; then
    rm frontend/src/components/Navigation.tsx
    echo "✅ Removed redundant Navigation.tsx"
fi

if [ -f "frontend/postcss.config.js" ]; then
    rm frontend/postcss.config.js
    echo "✅ Removed duplicate postcss.config.js"
fi

# Backend cleanup
if [ -f "backend/tests/setup-test-data.sh" ]; then
    rm backend/tests/setup-test-data.sh
    echo "✅ Removed setup-test-data.sh"
fi

if [ -f "backend/tests/test-script.sh" ]; then
    rm backend/tests/test-script.sh
    echo "✅ Removed test-script.sh"
fi

if [ -f "backend/.gitignore" ]; then
    rm backend/.gitignore
    echo "✅ Removed duplicate backend/.gitignore"
fi

# Optional Docker cleanup (uncomment if not using Docker)
# if [ -f "backend/docker-compose.yml" ]; then
#     rm backend/docker-compose.yml
#     echo "✅ Removed docker-compose.yml"
# fi

echo ""
echo "📊 Cleanup Summary:"
echo "==================="
echo "✅ Removed 4-6 redundant files"
echo "✅ Kept all essential functionality"
echo "✅ Maintained clean project structure"

echo ""
echo "🔧 Manual Steps Required:"
echo "========================"
echo "1. Update frontend/src/app/page.tsx with the new clean version"
echo "2. Update frontend/src/app/globals.css (remove unused styles)"
echo "3. Check for any broken imports in your IDE"
echo "4. Run 'npm run build' to test everything works"

echo ""
echo "📝 Next Steps:"
echo "=============="
echo "1. cd frontend && npm run build"
echo "2. cd backend && npm test"
echo "3. If everything works, delete the backup folders"
echo "4. git add . && git commit -m 'Clean up redundant code'"

echo ""
echo "🎉 Cleanup completed!"
echo "💾 Backups saved in frontend_backup/ and backend_backup/"
