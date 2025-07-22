# Deployment Guide - Vercel

This guide will walk you through deploying your Mood App to Vercel with Supabase authentication.

## Prerequisites

- GitHub account
- Vercel account (free at [vercel.com](https://vercel.com))
- Supabase project (free at [supabase.com](https://supabase.com))

## Step 1: Push to GitHub

1. Create a new repository on GitHub
2. Push your code to GitHub:

```bash
git add .
git commit -m "Initial commit: Next.js app with Supabase auth"
git remote add origin https://github.com/yourusername/moodapp.git
git push -u origin main
```

## Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a Next.js project
5. Click "Deploy"

## Step 3: Configure Environment Variables

1. In your Vercel project dashboard, go to "Settings" → "Environment Variables"
2. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Replace the values with your actual Supabase project credentials
4. Click "Save"
5. Redeploy your project (Vercel will do this automatically)

## Step 4: Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" → "URL Configuration"
3. Add your Vercel domain to the allowed redirect URLs:
   - `https://your-project.vercel.app/auth/callback`
   - `https://your-project.vercel.app`
4. Update the Site URL to your Vercel domain
5. Save the changes

## Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Try signing up with a new account
3. Check your email for the confirmation link
4. Sign in and test the authentication flow

## Troubleshooting

### Build Errors
- Make sure all environment variables are set in Vercel
- Check that your Supabase project is active
- Verify your API keys are correct

### Authentication Issues
- Ensure redirect URLs are properly configured in Supabase
- Check that your Vercel domain is added to allowed URLs
- Verify email templates are set up in Supabase

### Performance
- Vercel automatically optimizes Next.js apps
- Enable Vercel Analytics for performance monitoring
- Consider using Vercel Edge Functions for better performance

## Custom Domain (Optional)

1. In Vercel dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Update DNS records as instructed
4. Update Supabase redirect URLs to include your custom domain

## Monitoring

- Use Vercel Analytics to monitor performance
- Set up error tracking with Sentry or similar
- Monitor Supabase usage in your dashboard

## Security Best Practices

- Never commit `.env.local` to version control
- Use environment variables for all sensitive data
- Regularly rotate your Supabase API keys
- Enable Row Level Security (RLS) in Supabase
- Set up proper CORS policies

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs) 