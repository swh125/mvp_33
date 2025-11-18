'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { mockAuth } from '@/lib/mock-auth'
import { getUserConversations, mockUsers } from '@/lib/mock-data'
import { mockMessageService } from '@/lib/mock-messages'
import { Sidebar } from '@/components/chat/sidebar'
import { WorkspaceHeader } from '@/components/chat/workspace-header'
import { ChatHeader } from '@/components/chat/chat-header'
import { MessageList } from '@/components/chat/message-list'
import { MessageInput } from '@/components/chat/message-input'
import { NewConversationDialog } from '@/components/contacts/new-conversation-dialog'
import { User, Workspace, ConversationWithDetails, MessageWithSender } from '@/lib/types'
import { MessageSquare } from 'lucide-react'

export default function ChatPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string>()
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [showNewConversation, setShowNewConversation] = useState(false)

  useEffect(() => {
    const user = mockAuth.getCurrentUser()
    const workspace = mockAuth.getCurrentWorkspace()

    if (!user || !workspace) {
      router.push('/login')
      return
    }

    setCurrentUser(user)
    setCurrentWorkspace(workspace)

    const userConversations = getUserConversations(user.id, workspace.id)
    setConversations(userConversations)
    
    if (userConversations.length > 0) {
      setSelectedConversationId(userConversations[0].id)
    }
  }, [router])

  useEffect(() => {
    if (selectedConversationId) {
      const conversationMessages = mockMessageService.getMessages(selectedConversationId)
      setMessages(conversationMessages)
    }
  }, [selectedConversationId])

  if (!currentUser || !currentWorkspace) {
    return null
  }

  const selectedConversation = conversations.find(c => c.id === selectedConversationId)

  const handleNewConversation = () => {
    setShowNewConversation(true)
  }

  const handleSendMessage = (content: string, type: string = 'text', file?: File) => {
    if (!selectedConversationId || !currentUser) return

    const newMessage = mockMessageService.sendMessage(
      selectedConversationId,
      currentUser.id,
      content,
      type,
      file
    )

    setMessages(prev => [...prev, newMessage])
  }

  const handleCreateDirect = (userId: string) => {
    console.log('[v0] Create direct conversation with:', userId)
  }

  const handleCreateGroup = (userIds: string[], name: string) => {
    console.log('[v0] Create group conversation:', name, userIds)
  }

  return (
    <div className="flex h-screen flex-col">
      <WorkspaceHeader workspace={currentWorkspace} currentUser={currentUser} />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-80">
          <Sidebar
            conversations={conversations}
            currentConversationId={selectedConversationId}
            currentUser={currentUser}
            onSelectConversation={setSelectedConversationId}
            onNewConversation={handleNewConversation}
          />
        </div>

        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <ChatHeader 
                conversation={selectedConversation} 
                currentUser={currentUser} 
              />
              <MessageList messages={messages} currentUser={currentUser} />
              <MessageInput onSendMessage={handleSendMessage} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-semibold mb-2">No conversation selected</h3>
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <NewConversationDialog
        open={showNewConversation}
        onOpenChange={setShowNewConversation}
        users={mockUsers}
        currentUser={currentUser}
        onCreateDirect={handleCreateDirect}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  )
}
