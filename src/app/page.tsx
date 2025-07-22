'use client'

import { useAuth } from '@/lib/auth-context'
import { SignInForm } from '@/components/auth/sign-in-form'
import { Header, HeaderTitle, HeaderDescription } from '@/components/ui/header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { TodayView } from '@/components/journal/today-view'
import { JournalView } from '@/components/journal/journal-view'
import { TrendsView } from '@/components/journal/trends-view'

import { UserProfile } from '@/components/auth/user-profile'

export default function Home() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Header>
            <HeaderTitle>Mood App</HeaderTitle>
            <HeaderDescription>
              Welcome to your personal mood tracking application
            </HeaderDescription>
          </Header>
          <SignInForm />
          
          {/* Demo Login for Testing */}
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">
              For testing without Supabase setup:
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                // Mock login for demo purposes
                localStorage.setItem('demo-user', 'true')
                window.location.reload()
              }}
            >
              Demo Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[600px] mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <Header>
            <HeaderTitle>Mood App</HeaderTitle>
            <HeaderDescription>
              {(() => {
                const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'there'
                return `Welcome back, ${userName}! Track your emotional journey`
              })()}
            </HeaderDescription>
          </Header>
          <Button 
            variant="outline" 
            size="sm"
            onClick={signOut}
          >
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="journal">Journal</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="mt-6">
            <TodayView />
          </TabsContent>
          
          <TabsContent value="journal" className="mt-6">
            <JournalView />
          </TabsContent>
          
          <TabsContent value="trends" className="mt-6">
            <TrendsView />
          </TabsContent>
          
          <TabsContent value="profile" className="mt-6">
            <UserProfile />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
