'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ConversationWithDetails, User } from '@/lib/types'
import { Hash, Lock, Users, Search, Plus, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  conversations: ConversationWithDetails[]
  currentConversationId?: string
  currentUser: User
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
}

export function Sidebar({ 
  conversations, 
  currentConversationId, 
  currentUser,
  onSelectConversation,
  onNewConversation 
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      conv.name?.toLowerCase().includes(query) ||
      conv.members.some(m => m.full_name.toLowerCase().includes(query))
    )
  })

  const getConversationDisplay = (conversation: ConversationWithDetails) => {
    if (conversation.type === 'direct') {
      const otherUser = conversation.members.find(m => m.id !== currentUser.id)
      return {
        name: otherUser?.full_name || 'Unknown User',
        avatar: otherUser?.avatar_url,
        subtitle: otherUser?.title || '',
      }
    }
    return {
      name: conversation.name || 'Unnamed',
      avatar: conversation.avatar_url,
      subtitle: `${conversation.members.length} members`,
    }
  }

  const getConversationIcon = (type: string, isPrivate: boolean) => {
    if (type === 'direct') return null
    if (type === 'group') return <Users className="h-4 w-4" />
    return isPrivate ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />
  }

  const formatTimestamp = (date: string) => {
    const now = new Date()
    const msgDate = new Date(date)
    const diffMs = now.getTime() - msgDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return msgDate.toLocaleDateString()
  }

  return (
    <div className="flex h-full flex-col border-r bg-background">
      {/* Search header */}
      <div className="border-b p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Button 
            size="icon" 
            variant="ghost"
            onClick={onNewConversation}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => router.push('/contacts')}
        >
          <Users className="h-4 w-4 mr-2" />
          View Contacts
        </Button>
      </div>

      {/* Conversations list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.map((conversation) => {
            const display = getConversationDisplay(conversation)
            const isActive = conversation.id === currentConversationId

            return (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={cn(
                  'w-full flex items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent',
                  isActive && 'bg-accent'
                )}
              >
                <div className="relative">
                  {conversation.type === 'direct' ? (
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={display.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {display.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {getConversationIcon(conversation.type, conversation.is_private)}
                    </div>
                  )}
                  {conversation.unread_count > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {conversation.unread_count}
                    </Badge>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium truncate">{display.name}</span>
                    {conversation.last_message_at && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatTimestamp(conversation.last_message_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.last_message?.content || display.subtitle}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
