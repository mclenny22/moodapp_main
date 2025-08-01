'use client'

import { useAuth } from '@/lib/auth-context'
import { SignInForm } from '@/components/auth/sign-in-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TodayView } from '@/components/journal/today-view'
import { JournalView } from '@/components/journal/journal-view'
import { TrendsView } from '@/components/journal/trends-view'

import { Settings } from '@/components/auth/settings'

export default function Home() {
  const { user, loading } = useAuth()

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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6" style={{ background: 'transparent' }}>
        <div className="w-full max-w-sm sm:max-w-md">
          <SignInForm showDemoButton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[600px] mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-4 gap-1 sm:gap-2">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="journal">Journal</TabsTrigger>
            <TabsTrigger value="trends">Insights</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today" className="mt-4 sm:mt-6">
            <TodayView userName={user.user_metadata?.display_name || user.user_metadata?.name || user.email?.split('@')[0] || 'there'} />
          </TabsContent>
          
          <TabsContent value="journal" className="mt-4 sm:mt-6">
            <JournalView />
          </TabsContent>
          
          <TabsContent value="trends" className="mt-4 sm:mt-6">
            <TrendsView />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-4 sm:mt-6 relative z-10">
            <Settings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
