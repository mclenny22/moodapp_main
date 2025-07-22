# Mood App

A Next.js web application with Supabase authentication, built with shadcn/ui components and deployed on Vercel.

## Features

- 🔐 **Supabase Authentication** - Secure user authentication with email/password
- 📝 **Journal Entry System** - Daily mood tracking with AI analysis
- 📊 **Sentiment Analysis** - AI-powered emotional tone analysis (-5 to +5 scale)
- 🏷️ **Theme Extraction** - Automatic tagging of emotional themes
- 📈 **Trends & Analytics** - Visual mood trends and insights
- 🎨 **shadcn/ui Components** - Beautiful, accessible UI components
- 📱 **Mobile-First Design** - Optimized for mobile with 600px max-width on desktop
- 🌙 **Dark Mode Support** - Built-in dark/light theme switching
- ⚡ **Next.js 15** - Latest features with App Router
- 🚀 **Vercel Ready** - Optimized for deployment on Vercel

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase account

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd moodapp_main
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```
4. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### 4. Test the Application

**Option A: Demo Mode (No Supabase Setup Required)**
1. Click "Demo Login" to test the UI without authentication
2. Explore all features: Today, Journal, and Trends tabs
3. Test the responsive design on different screen sizes

**Option B: Full Authentication (Requires Supabase Setup)**
1. Click "Sign Up" to create a new account
2. Check your email for the confirmation link
3. Sign in with your credentials
4. Start journaling and see AI analysis in action

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── auth/           # Authentication components
│   └── ui/             # shadcn/ui components
└── lib/                # Utility functions and configurations
    ├── auth-context.tsx # Authentication context
    ├── supabase.ts     # Supabase client configuration
    └── utils.ts        # Utility functions
```

## Deployment on Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy on Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy!

### 3. Configure Supabase

1. Go to your Supabase project settings
2. Add your Vercel domain to the allowed redirect URLs
3. Update your site URL in Supabase settings

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details
