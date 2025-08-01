'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircleIcon, CheckCircle2Icon } from 'lucide-react'

export function SignInForm({ showDemoButton = false }: { showDemoButton?: boolean }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Signed in successfully!')
        // Redirect or refresh to update auth state
        window.location.reload()
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (!name.trim()) {
      setError('Please enter your name')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name.trim(),
            display_name: name.trim(),
          }
        }
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email for the confirmation link!')
        // Clear form after successful signup
        setEmail('')
        setPassword('')
        setName('')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const clearMessages = () => {
    setError(null)
    setMessage(null)
  }

  return (
    <div className="box-border content-stretch flex flex-col gap-[20px] sm:gap-[30px] items-center justify-start p-[20px] sm:p-[25px] relative rounded-[25px] size-full">
      {/* Card Border */}
      <div
        aria-hidden="true"
        className="absolute border border-[var(--card-border)] border-solid inset-0 pointer-events-none rounded-[25px]"
      />
      
      {/* Header Content */}
      <div className="box-border content-stretch flex flex-col gap-2 items-center justify-start leading-[0] not-italic p-0 relative shrink-0 text-left text-nowrap w-full">
        <div className="font-inter font-normal relative shrink-0 text-[var(--base-text)] text-[20px]">
          <p className="block leading-[normal] text-nowrap whitespace-pre">
            Welcome
          </p>
        </div>
        <div className="font-inter font-normal relative shrink-0 text-[var(--annotation)] text-[16px]">
          <p className="block leading-[normal] text-nowrap whitespace-pre">
            Track your emotions with AI-powered insights.
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="box-border content-stretch flex flex-col gap-[20px] sm:gap-[25px] items-center justify-start p-0 relative shrink-0 w-full">
        {/* Custom Tabs */}
        <div className="bg-[var(--primary-inactive)] box-border content-stretch flex flex-row h-9 sm:h-10 items-center justify-end p-[3px] sm:p-[4px] relative rounded-[10px] shrink-0">
          <button
            onClick={() => {
              setActiveTab('signin')
              clearMessages()
            }}
            className={`box-border content-stretch flex flex-row h-full items-center justify-center overflow-clip px-[8px] sm:px-[11px] py-[4px] sm:py-[5px] relative rounded-[7px] shrink-0 transition-all duration-200 ${
              activeTab === 'signin' 
                ? 'bg-[var(--button-primary)]' 
                : ''
            }`}
          >
            <div className={`flex flex-col font-inter font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-nowrap ${
              activeTab === 'signin' ? 'text-[var(--button-text-primary)]' : 'text-[var(--annotation)]'
            }`}>
              <p className="block leading-[normal] whitespace-pre">Sign In</p>
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('signup')
              clearMessages()
            }}
            className={`box-border content-stretch flex flex-row h-full items-center justify-center px-[8px] sm:px-[11px] py-[4px] sm:py-[5px] relative rounded-[7px] shrink-0 transition-all duration-200 ${
              activeTab === 'signup' 
                ? 'bg-[var(--button-primary)]' 
                : ''
            }`}
          >
            <div className={`flex flex-col font-inter font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-nowrap ${
              activeTab === 'signup' ? 'text-[var(--button-text-primary)]' : 'text-[var(--annotation)]'
            }`}>
              <p className="block leading-[normal] whitespace-pre">Sign Up</p>
            </div>
          </button>
        </div>

        {/* Form Fields */}
        {activeTab === 'signin' ? (
          <form onSubmit={handleSignIn} className="box-border content-stretch flex flex-col gap-[20px] sm:gap-[25px] items-center justify-start p-0 relative shrink-0 w-full">
            {/* Email Field */}
            <div className="box-border content-stretch flex flex-col gap-[5px] items-start justify-start p-0 relative shrink-0 w-full">
              <div className="font-inter font-normal leading-[0] not-italic relative shrink-0 text-[var(--annotation)] text-[12px] text-left text-nowrap">
                <p className="block leading-[normal] whitespace-pre">Email</p>
              </div>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[var(--primary-inactive)] border border-[var(--card-border)] rounded-[10px] h-[45px] sm:h-[50px] px-[12px] sm:px-[15px] font-inter font-normal text-[var(--base-text)] text-[13px] sm:text-[14px] placeholder:text-[var(--annotation)] focus:ring-0 focus:border-[var(--card-border)] focus:outline-none"
              />
            </div>

            {/* Password Field */}
            <div className="box-border content-stretch flex flex-col gap-[5px] items-start justify-start p-0 relative shrink-0 w-full">
              <div className="font-inter font-normal leading-[0] not-italic relative shrink-0 text-[var(--annotation)] text-[12px] text-left text-nowrap">
                <p className="block leading-[normal] whitespace-pre">Password</p>
              </div>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[var(--primary-inactive)] border border-[var(--card-border)] rounded-[10px] h-[45px] sm:h-[50px] px-[12px] sm:px-[15px] font-inter font-normal text-[var(--base-text)] text-[13px] sm:text-[14px] placeholder:text-[var(--annotation)] focus:ring-0 focus:border-[var(--card-border)] focus:outline-none"
              />
            </div>

            {/* Error/Message Display */}
            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-700 text-red-300">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {message && (
              <Alert className="bg-green-900/20 border-green-700 text-green-300">
                <CheckCircle2Icon className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {/* Buttons */}
            <div className="box-border content-stretch flex flex-col gap-2.5 items-start justify-start p-0 relative shrink-0 w-full">
              <button
                type="submit"
                disabled={loading}
                className="bg-[var(--button-primary)] box-border content-stretch flex flex-row gap-2.5 h-[45px] sm:h-[50px] items-center justify-center px-[116px] py-4 sm:py-5 relative rounded-[10px] shrink-0 w-full hover:bg-[#e0e0e0] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="font-inter font-normal leading-[0] not-italic relative shrink-0 text-[var(--button-text-primary)] text-[13px] sm:text-[14px] text-center text-nowrap">
                  <p className="block leading-[normal] whitespace-pre">
                    {loading ? 'Signing in...' : 'Sign In'}
                  </p>
                </div>
              </button>
              
              {showDemoButton && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('demo-user', 'true')
                    window.location.reload()
                  }}
                  className="box-border content-stretch flex flex-row gap-2.5 h-[45px] sm:h-[50px] items-center justify-center px-[116px] py-4 sm:py-5 relative rounded-[10px] shrink-0 w-full hover:bg-[#4d4d4d] transition-colors duration-200"
                >
                  <div
                    aria-hidden="true"
                    className="absolute border border-[var(--button-primary)] border-solid inset-0 pointer-events-none rounded-[10px]"
                  />
                  <div className="font-inter font-normal leading-[0] not-italic relative shrink-0 text-[var(--button-text-secondary)] text-[13px] sm:text-[14px] text-center text-nowrap">
                    <p className="block leading-[normal] whitespace-pre">
                      Demo Login
                    </p>
                  </div>
                </button>
              )}
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="box-border content-stretch flex flex-col gap-[20px] sm:gap-[25px] items-center justify-start p-0 relative shrink-0 w-full">
            {/* Name Field */}
            <div className="box-border content-stretch flex flex-col gap-[5px] items-start justify-start p-0 relative shrink-0 w-full">
              <div className="font-inter font-normal leading-[0] not-italic relative shrink-0 text-[var(--annotation)] text-[12px] text-left text-nowrap">
                <p className="block leading-[normal] whitespace-pre">Full Name</p>
              </div>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-[var(--primary-inactive)] border border-[var(--card-border)] rounded-[10px] h-[45px] sm:h-[50px] px-[12px] sm:px-[15px] font-inter font-normal text-[var(--base-text)] text-[13px] sm:text-[14px] placeholder:text-[var(--annotation)] focus:ring-0 focus:border-[var(--card-border)] focus:outline-none"
              />
            </div>

            {/* Email Field */}
            <div className="box-border content-stretch flex flex-col gap-[5px] items-start justify-start p-0 relative shrink-0 w-full">
              <div className="font-inter font-normal leading-[0] not-italic relative shrink-0 text-[var(--annotation)] text-[12px] text-left text-nowrap">
                <p className="block leading-[normal] whitespace-pre">Email</p>
              </div>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[var(--primary-inactive)] border border-[var(--card-border)] rounded-[10px] h-[45px] sm:h-[50px] px-[12px] sm:px-[15px] font-inter font-normal text-[var(--base-text)] text-[13px] sm:text-[14px] placeholder:text-[var(--annotation)] focus:ring-0 focus:border-[var(--card-border)] focus:outline-none"
              />
            </div>

            {/* Password Field */}
            <div className="box-border content-stretch flex flex-col gap-[5px] items-start justify-start p-0 relative shrink-0 w-full">
              <div className="font-inter font-normal leading-[0] not-italic relative shrink-0 text-[var(--annotation)] text-[12px] text-left text-nowrap">
                <p className="block leading-[normal] whitespace-pre">Password</p>
              </div>
              <Input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[var(--primary-inactive)] border border-[var(--card-border)] rounded-[10px] h-[45px] sm:h-[50px] px-[12px] sm:px-[15px] font-inter font-normal text-[var(--base-text)] text-[13px] sm:text-[14px] placeholder:text-[var(--annotation)] focus:ring-0 focus:border-[var(--card-border)] focus:outline-none"
              />
            </div>

            {/* Error/Message Display */}
            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-700 text-red-300">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {message && (
              <Alert className="bg-green-900/20 border-green-700 text-green-300">
                <CheckCircle2Icon className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {/* Create Account Button */}
            <div className="box-border content-stretch flex flex-col gap-2.5 items-start justify-start p-0 relative shrink-0 w-full">
              <button
                type="submit"
                disabled={loading}
                className="bg-[var(--button-primary)] box-border content-stretch flex flex-row gap-2.5 h-[45px] sm:h-[50px] items-center justify-center px-[116px] py-4 sm:py-5 relative rounded-[10px] shrink-0 w-full hover:bg-[#e0e0e0] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="font-inter font-normal leading-[0] not-italic relative shrink-0 text-[var(--button-text-primary)] text-[13px] sm:text-[14px] text-center text-nowrap">
                  <p className="block leading-[normal] whitespace-pre">
                    {loading ? 'Creating account...' : 'Create Account'}
                  </p>
                </div>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
} 