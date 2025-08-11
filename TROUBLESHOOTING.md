# Troubleshooting Guide

## Common Errors and Solutions

### 1. "Failed to analyze sentiment" Error

**Symptoms:**
- HTTP 500 error when submitting journal entries
- Console shows "Failed to analyze sentiment"
- Journal entry submission fails

**Causes & Solutions:**

#### A. Missing OpenAI API Key
```
Error: OpenAI API key not configured
```
**Solution:** 
1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to your `.env.local` file:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
3. Restart your development server

#### B. OpenAI Rate Limit/Quota Exceeded
```
Error: OpenAI rate limit exceeded
Error: OpenAI quota exceeded
```
**Solution:**
1. Check your OpenAI usage at [OpenAI Platform](https://platform.openai.com/usage)
2. Wait for rate limit reset or upgrade your plan
3. Consider implementing retry logic with exponential backoff

#### C. Invalid OpenAI Model
**Solution:**
- The app now uses `gpt-4o-mini` which is widely available
- If you prefer a different model, update the model name in:
  - `src/app/api/sentiment/route.ts`
  - `src/app/api/reflection-prompt/route.ts`

### 2. Database Connection Errors

**Symptoms:**
- HTTP 406 errors for "entries" resources
- "Database table not found" errors
- Authentication failures

**Causes & Solutions:**

#### A. Missing Supabase Configuration
```
Error: Missing required environment variables
```
**Solution:**
1. Set up a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Project Settings > API
3. Add to your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Restart your development server

#### B. Database Schema Not Set Up
```
Error: Database table not found
```
**Solution:**
1. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
2. Ensure Row Level Security (RLS) policies are properly configured
3. Check that the `entries` table exists with the correct structure

#### C. Authentication Issues
```
Error: User not found or unauthorized
```
**Solution:**
1. Ensure Supabase Auth is properly configured
2. Check that RLS policies allow authenticated users to access their entries
3. Verify the user is properly signed in before submitting entries

### 3. Client-Side Errors

**Symptoms:**
- "Error submitting entry" in the UI
- Entries not saving despite successful API calls
- Inconsistent state between components

**Solutions:**

#### A. Check Browser Console
1. Open Developer Tools (F12)
2. Look for error messages in the Console tab
3. Check the Network tab for failed API requests

#### B. Verify Environment Variables
1. Ensure all required environment variables are set
2. Check that the `.env.local` file is in your project root
3. Restart the development server after changing environment variables

#### C. Clear Browser Cache
1. Clear browser cache and cookies
2. Try in an incognito/private window
3. Check if the issue persists across different browsers

## Environment Setup Checklist

### Required Environment Variables
```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...

# Supabase Configuration  
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Database Setup
1. ✅ Create Supabase project
2. ✅ Run `supabase-schema.sql` in SQL editor
3. ✅ Enable Row Level Security
4. ✅ Configure authentication providers
5. ✅ Test database connection

### API Testing
1. ✅ Test OpenAI API key validity
2. ✅ Test Supabase connection
3. ✅ Verify RLS policies work
4. ✅ Test journal entry creation

## Getting Help

If you're still experiencing issues:

1. **Check the console logs** for detailed error messages
2. **Verify your environment variables** are correctly set
3. **Test your API keys** independently
4. **Check the Network tab** in browser dev tools for failed requests
5. **Review the error messages** - they now provide more specific guidance

## Common Fixes

### Quick Environment Check
```bash
# Check if environment variables are loaded
npm run dev
# Look for "Environment validation failed" in console
```

### Reset Database
```sql
-- In Supabase SQL editor
DROP TABLE IF EXISTS entries CASCADE;
-- Then re-run supabase-schema.sql
```

### Test OpenAI Connection
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.openai.com/v1/models
```
