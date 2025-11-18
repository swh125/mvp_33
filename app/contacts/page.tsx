'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { mockAuth } from '@/lib/mock-auth'
import { mockUsers } from '@/lib/mock-data'
import { ContactsPanel } from '@/components/contacts/contacts-panel'
import { WorkspaceHeader } from '@/components/chat/workspace-header'
import { User, Workspace } from '@/lib/types'

export default function ContactsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)

  useEffect(() => {
    const user = mockAuth.getCurrentUser()
    const workspace = mockAuth.getCurrentWorkspace()

    if (!user || !workspace) {
      router.push('/login')
      return
    }

    setCurrentUser(user)
    setCurrentWorkspace(workspace)
  }, [router])

  if (!currentUser || !currentWorkspace) {
    return null
  }

  const handleStartChat = (userId: string) => {
    // TODO: Create or navigate to direct conversation
    console.log('[v0] Start chat with user:', userId)
    router.push('/chat')
  }

  return (
    <div className="flex h-screen flex-col">
      <WorkspaceHeader workspace={currentWorkspace} currentUser={currentUser} />
      <div className="flex-1 overflow-hidden">
        <ContactsPanel
          users={mockUsers}
          currentUser={currentUser}
          onStartChat={handleStartChat}
        />
      </div>
    </div>
  )
}
