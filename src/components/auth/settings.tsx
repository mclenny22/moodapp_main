'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ModeToggle } from '@/components/mode-toggle'

export function Settings() {
  const { user, signOut } = useAuth()

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    try {
      console.log('Signing out...')
      await signOut()
      console.log('Sign out completed')
      // Force page reload to ensure clean state
      window.location.reload()
    } catch (error) {
      console.error('Sign out error:', error)
      // Even if there's an error, reload to ensure clean state
      window.location.reload()
    }
  }

  const handleTestClick = () => {
    console.log('Test button clicked!')
    alert('Test button works!')
  }

  // Get user's name from metadata or fallback to email
  const userName = user.user_metadata?.display_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <div className="space-y-4 p-6 border rounded-lg bg-card">
      <div>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarFallback>
            {userInitial}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Email verified</span>
          <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
            {user.email_confirmed_at ? 'Yes' : 'No'}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Member since</span>
          <span className="text-sm text-muted-foreground">
            {new Date(user.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Theme</span>
          <ModeToggle />
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Button 
          onClick={handleTestClick} 
          variant="secondary" 
          className="w-full"
        >
          Test Button (Click me!)
        </Button>
        
        <Button 
          onClick={handleSignOut} 
          variant="destructive" 
          className="w-full cursor-pointer"
          type="button"
        >
          Sign Out
        </Button>
      </div>
    </div>
  )
} 