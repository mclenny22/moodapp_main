#!/bin/bash

echo "🚀 Setting up Mood App environment variables..."
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Create .env.local with placeholder values
cat > .env.local << EOF
# Supabase Configuration
# Replace these with your actual Supabase project values
# Get these from: https://supabase.com/dashboard/project/_/settings/api

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: Supabase Service Role Key (for server-side operations)
# SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
EOF

echo "✅ Created .env.local with placeholder values"
echo ""
echo "📝 Next steps:"
echo "1. Go to https://supabase.com and create a new project"
echo "2. Navigate to Settings > API in your Supabase dashboard"
echo "3. Copy your Project URL and anon/public key"
echo "4. Update .env.local with your actual values"
echo ""
echo "🔧 To start development:"
echo "   npm run dev"
echo ""
echo "🌐 To build for production:"
echo "   npm run build" 