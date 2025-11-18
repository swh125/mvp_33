'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { ConversationWithDetails } from '@/lib/types'
import { Search, Plus, Hash, Lock, Users, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChannelsPanelProps {
  conversations: ConversationWithDetails[]
  onSelectChannel: (id: string) => void
  onCreateChannel: () => void
  selectedChannelId?: string
}

export function ChannelsPanel({
  conversations,
  onSelectChannel,
  onCreateChannel,
  selectedChannelId,
}: ChannelsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Separate channels and groups
  const channels = conversations.filter(c => c.type === 'channel')
  const groups = conversations.filter(c => c.type === 'group')

  const filterConversations = (convs: ConversationWithDetails[]) => {
    if (!searchQuery) return convs
    const query = searchQuery.toLowerCase()
    return convs.filter(c => c.name?.toLowerCase().includes(query))
  }

  const filteredChannels = filterConversations(channels)
  const filteredGroups = filterConversations(groups)

  const publicChannels = filteredChannels.filter(c => !c.is_private)
  const privateChannels = filteredChannels.filter(c => c.is_private)

  const getChannelIcon = (isPrivate: boolean) => {
    return isPrivate ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />
  }

  const ChannelItem = ({ conversation }: { conversation: ConversationWithDetails }) => {
    const isSelected = selectedChannelId === conversation.id

    return (
      <button
        onClick={() => onSelectChannel(conversation.id)}
        className={cn(
          'w-full flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors hover:bg-accent',
          isSelected && 'bg-accent font-medium'
        )}
      >
        {getChannelIcon(conversation.is_private)}
        <span className="flex-1 truncate text-left">{conversation.name}</span>
        {conversation.unread_count > 0 && (
          <Badge variant="destructive" className="h-5 px-1.5 text-xs">
            {conversation.unread_count}
          </Badge>
        )}
      </button>
    )
  }

  const GroupItem = ({ conversation }: { conversation: ConversationWithDetails }) => {
    const isSelected = selectedChannelId === conversation.id

    return (
      <button
        onClick={() => onSelectChannel(conversation.id)}
        className={cn(
          'w-full flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors hover:bg-accent',
          isSelected && 'bg-accent font-medium'
        )}
      >
        <Users className="h-4 w-4" />
        <span className="flex-1 truncate text-left">{conversation.name}</span>
        {conversation.unread_count > 0 && (
          <Badge variant="destructive" className="h-5 px-1.5 text-xs">
            {conversation.unread_count}
          </Badge>
        )}
      </button>
    )
  }

  return (
    <div className="flex h-full flex-col border-r bg-background w-64">
      {/* Header */}
      <div className="border-b p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Channels & Groups</h2>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onCreateChannel}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      {/* Channels & Groups list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {/* Public Channels */}
          {publicChannels.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-2 py-1 mb-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Public Channels
                </span>
              </div>
              <div className="space-y-0.5">
                {publicChannels.map(channel => (
                  <ChannelItem key={channel.id} conversation={channel} />
                ))}
              </div>
            </div>
          )}

          {/* Private Channels */}
          {privateChannels.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-2 py-1 mb-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Private Channels
                </span>
              </div>
              <div className="space-y-0.5">
                {privateChannels.map(channel => (
                  <ChannelItem key={channel.id} conversation={channel} />
                ))}
              </div>
            </div>
          )}

          {/* Groups */}
          {filteredGroups.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-2 py-1 mb-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Groups
                </span>
              </div>
              <div className="space-y-0.5">
                {filteredGroups.map(group => (
                  <GroupItem key={group.id} conversation={group} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {filteredChannels.length === 0 && filteredGroups.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No channels or groups found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
