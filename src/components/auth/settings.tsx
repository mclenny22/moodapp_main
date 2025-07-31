'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useTheme } from 'next-themes'

export function Settings() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()

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

  // Get user's name from metadata or fallback to email
  const userName = user.user_metadata?.display_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <div className="box-border content-stretch flex flex-col gap-[30px] items-start justify-start p-[25px] relative rounded-[25px] w-full font-sans">
      {/* Card Border */}
      <div
        aria-hidden="true"
        className="absolute border border-[var(--card-border)] border-solid inset-0 pointer-events-none rounded-[25px]"
      />
      
      {/* Header Section */}
      <div className="box-border content-stretch flex flex-col font-sans font-normal gap-2 items-start justify-start leading-[0] not-italic p-0 relative shrink-0 text-left w-full">
        <div className="min-w-full relative shrink-0 text-[var(--base-text)] text-[18px]">
          <p className="block leading-[normal]">Settings</p>
        </div>
        <div className="relative shrink-0 text-[var(--annotation)] text-[12px] text-nowrap">
          <p className="block leading-[normal] whitespace-pre">
            Manage your account and preferences
          </p>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="box-border content-stretch flex flex-col gap-[15px] items-start justify-start p-0 relative shrink-0 w-full">
        {/* User Info Row */}
        <div className="box-border content-stretch flex flex-row gap-[30px] items-center justify-start p-0 relative shrink-0 w-full">
          <div className="basis-0 box-border content-stretch flex flex-col font-sans font-normal gap-2 grow items-start justify-start leading-[0] min-h-px min-w-px not-italic p-0 relative shrink-0 text-left">
            <div className="min-w-full relative shrink-0 text-[var(--base-text)] text-[14px]">
              <p className="block leading-[normal]">Name</p>
            </div>
            <div className="relative shrink-0 text-[var(--annotation)] text-[12px] text-nowrap">
              <p className="block leading-[normal] whitespace-pre">
                {user.email}
              </p>
            </div>
          </div>
          <div className="relative shrink-0 size-[50px]">
            <Avatar>
              <AvatarFallback className="w-full h-full text-[var(--base-text)] bg-[var(--primary-inactive)]">
                {userInitial}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* Separator */}
        <div className="h-0 relative shrink-0 w-full">
          <div className="absolute bottom-0 left-0 right-0 top-[-1px] border-b border-[var(--card-border)]"></div>
        </div>
        
        {/* Email Verified Row */}
        <div className="box-border content-stretch flex flex-row items-center justify-between p-0 relative shrink-0 w-full">
          <div className="font-sans font-normal leading-[0] not-italic relative shrink-0 text-[var(--base-text)] text-[14px] text-left text-nowrap">
            <p className="block leading-[normal] whitespace-pre">
              Email Verified
            </p>
          </div>
          <div className="relative rounded-[23px] shrink-0">
            <div className="box-border content-stretch flex flex-row gap-1 items-center justify-center overflow-clip px-[9px] py-[3px] relative">
              <div className="flex flex-col font-sans font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#72e485] text-[12px] text-center text-nowrap">
                <p className="block leading-[normal] whitespace-pre">
                  {user.email_confirmed_at ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="absolute border border-[#72e485] border-solid inset-0 pointer-events-none rounded-[23px]"
            />
          </div>
        </div>
        
        {/* Member Since Row */}
        <div className="box-border content-stretch flex flex-row font-sans font-normal items-center justify-between leading-[0] not-italic p-0 relative shrink-0 text-left text-nowrap w-full">
          <div className="relative shrink-0 text-[var(--base-text)] text-[14px]">
            <p className="block leading-[normal] text-nowrap whitespace-pre">
              Member Since
            </p>
          </div>
          <div className="relative shrink-0 text-[var(--annotation)] text-[12px]">
            <p className="block leading-[normal] text-nowrap whitespace-pre">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {/* Separator */}
        <div className="h-0 relative shrink-0 w-full">
          <div className="absolute bottom-0 left-0 right-0 top-[-1px] border-b border-[var(--card-border)]"></div>
        </div>
        
        {/* Dark Mode Row */}
        <div className="box-border content-stretch flex flex-row items-center justify-between p-0 relative shrink-0 w-full">
          <div className="font-sans font-normal leading-[0] not-italic relative shrink-0 text-[var(--base-text)] text-[14px] text-left text-nowrap">
            <p className="block leading-[normal] whitespace-pre">Dark Mode</p>
          </div>
          <div className="relative shrink-0">
            <Switch
              id="dark-mode"
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </div>
      </div>
      
      {/* Sign Out Button */}
      <div className="box-border content-stretch flex flex-col gap-2.5 items-end justify-start p-0 relative shrink-0 w-full">
        <button
          onClick={handleSignOut}
          className="bg-[#f46f6f] box-border content-stretch flex flex-row gap-2.5 h-[50px] items-center justify-center p-[20px] relative rounded-[10px] shrink-0 w-full cursor-pointer hover:bg-[#e55a5a] transition-colors"
          type="button"
        >
          <div className="font-sans font-normal leading-[0] not-italic relative shrink-0 text-[var(--button-text-primary)] text-[14px] text-center text-nowrap">
            <p className="block leading-[normal] whitespace-pre">Sign Out</p>
          </div>
        </button>
      </div>
    </div>
  )
} 