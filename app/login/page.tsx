'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { WorkspaceSelector } from '@/components/workspace/workspace-selector'
import { mockAuth } from '@/lib/mock-auth'
import { Workspace } from '@/lib/types'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'login' | 'workspace'>('login')

  useEffect(() => {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        {step === 'login' ? (
          <LoginForm onSuccess={handleLoginSuccess} />
        ) : (
          <WorkspaceSelector onSelect={handleWorkspaceSelect} />
        )}
      </div>
    </div>
  )
}
