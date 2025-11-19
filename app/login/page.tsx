'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { RegisterForm } from '@/components/auth/register-form'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { WorkspaceSelector } from '@/components/workspace/workspace-selector'
import { mockAuth } from '@/lib/mock-auth'
import { Workspace } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/lib/settings-context'
import { Languages } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'login' | 'register' | 'reset-password' | 'workspace'>('login')
  const { language, setLanguage } = useSettings()

  useEffect(() => {
    // Handle OAuth callback
    const searchParams = new URLSearchParams(window.location.search)
    const oauth = searchParams.get('oauth')
    const provider = searchParams.get('provider')
    const token = searchParams.get('token')
    const userParam = searchParams.get('user')
    const error = searchParams.get('error')

    if (oauth === 'success' && token && userParam) {
      try {
        const user = JSON.parse(userParam)
        // Store user and token
        if (typeof window !== 'undefined') {
          localStorage.setItem('chat_app_current_user', JSON.stringify(user))
          localStorage.setItem('chat_app_token', token)
          // Clear URL params
          window.history.replaceState({}, '', '/login')
        }
        handleLoginSuccess()
      } catch (err) {
        console.error('Failed to parse OAuth user data:', err)
      }
    } else if (error) {
      console.error('OAuth error:', error)
      // You might want to show an error message to the user
    }

    // Check if already logged in
    const user = mockAuth.getCurrentUser()
    const workspace = mockAuth.getCurrentWorkspace()
    
    if (user && workspace) {
      router.push('/chat')
    } else if (user) {
      setStep('workspace')
    }
  }, [router])

  const handleLoginSuccess = () => {
    setStep('workspace')
  }

  const handleWorkspaceSelect = (workspace: Workspace) => {
    router.push('/chat')
  }

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      en: {
        forgotPassword: 'Forgot password?',
        noAccount: 'Don\'t have an account?',
        createAccount: 'Create one',
      },
      zh: {
        forgotPassword: '忘记密码？',
        noAccount: '没有账号？',
        createAccount: '立即注册',
      }
    }
    return translations[language]?.[key] || translations.en[key]
  }

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Button
        variant="outline"
        size="sm"
        onClick={toggleLanguage}
        className="fixed top-4 right-4 gap-2"
      >
        <Languages className="h-4 w-4" />
        {language === 'en' ? '中文' : 'English'}
      </Button>

      <div className="w-full max-w-md space-y-4">
        {step === 'login' && (
          <LoginForm 
            onSuccess={handleLoginSuccess}
            onForgotPassword={() => setStep('reset-password')}
            onRegister={() => setStep('register')}
          />
        )}
        {step === 'register' && (
          <RegisterForm 
            onSuccess={handleLoginSuccess}
            onBack={() => setStep('login')}
          />
        )}
        {step === 'reset-password' && (
          <ResetPasswordForm 
            onBack={() => setStep('login')}
          />
        )}
        {step === 'workspace' && (
          <WorkspaceSelector onSelect={handleWorkspaceSelect} />
        )}
      </div>
    </div>
  )
}
