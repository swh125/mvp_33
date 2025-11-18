'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { mockAuth } from '@/lib/mock-auth'
import { getUserConversations, mockUsers } from '@/lib/mock-data'
import { mockMessageService } from '@/lib/mock-messages'
import { WorkspaceHeader } from '@/components/chat/workspace-header'
import { ChannelsPanel } from '@/components/channels/channels-panel'
import { ChatHeader } from '@/components/chat/chat-header'
import { MessageList } from '@/components/chat/message-list'
import { MessageInput } from '@/components/chat/message-input'
import { ChannelInfoPanel } from '@/components/channels/channel-info-panel'
import { CreateChannelDialog } from '@/components/channels/create-channel-dialog'
import { User, Workspace, ConversationWithDetails, MessageWithSender } from '@/lib/types'
import { Hash } from 'lucide-react'

export default function ChannelsPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [selectedChannelId, setSelectedChannelId] = useState<string>()
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [showChannelInfo, setShowChannelInfo] = useState(false)
  const [showCreateChannel, setShowCreateChannel] = useState(false)

  useEffect(() => {
    const user = mockAuth.getCurrentUser()
    const workspace = mockAuth.getCurrentWorkspace()

    if (!user || !workspace) {
      router.push('/login')
      return
    }

    setCurrentUser(user)
    setCurrentWorkspace(workspace)

    // Load only channels and groups
    const allConversations = getUserConversations(user.id, workspace.id)
    const channelsAndGroups = allConversations.filter(
      c => c.type === 'channel' || c.type === 'group'
    )
    setConversations(channelsAndGroups)
    
    if (channelsAndGroups.length > 0) {
      setSelectedChannelId(channelsAndGroups[0].id)
    }
  }, [router])

  useEffect(() => {
    if (selectedChannelId) {
      const channelMessages = mockMessageService.getMessages(selectedChannelId)
      setMessages(channelMessages)
    }
  }, [selectedChannelId])

  if (!currentUser || !currentWorkspace) {
    return null
  }

  const selectedChannel = conversations.find(c => c.id === selectedChannelId)

  const handleSendMessage = (content: string, type: string = 'text') => {
    if (!selectedChannelId || !currentUser) return

    const newMessage = mockMessageService.sendMessage(
      selectedChannelId,
      currentUser.id,
      content,
      type
    )

    setMessages(prev => [...prev, newMessage])
  }

  const handleCreateChannel = (data: { name: string; description: string; isPrivate: boolean }) => {
    console.log('[v0] Create channel:', data)
  }

  return (
    <div className="flex h-screen flex-col">
      <WorkspaceHeader workspace={currentWorkspace} currentUser={currentUser} />

      <div className="flex flex-1 overflow-hidden">
        <ChannelsPanel
          conversations={conversations}
          onSelectChannel={setSelectedChannelId}
          onCreateChannel={() => setShowCreateChannel(true)}
          selectedChannelId={selectedChannelId}
        />

        <div className="flex-1 flex flex-col">
          {selectedChannel ? (
            <>
              <ChatHeader 
                conversation={selectedChannel} 
                currentUser={currentUser} 
              />
              <MessageList messages={messages} currentUser={currentUser} />
              <MessageInput onSendMessage={handleSendMessage} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Hash className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-semibold mb-2">No channel selected</h3>
                <p>Select a channel to view messages</p>
              </div>
            </div>
          )}
        </div>

        {selectedChannel && (
          <ChannelInfoPanel
            conversation={selectedChannel}
            isOpen={showChannelInfo}
            onClose={() => setShowChannelInfo(false)}
          />
        )}
      </div>

      <CreateChannelDialog
        open={showCreateChannel}
        onOpenChange={setShowCreateChannel}
        onCreateChannel={handleCreateChannel}
      />
    </div>
  )
}
