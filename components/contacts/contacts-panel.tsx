'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User } from '@/lib/types'
import { Search, UserPlus, Users, Star, Building2, MessageSquare, Phone, Video } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettings } from '@/lib/settings-context'
import { getTranslation } from '@/lib/i18n'

interface ContactsPanelProps {
  users: User[]
  currentUser: User
  onStartChat: (userId: string) => void
}

export function ContactsPanel({ users, currentUser, onStartChat }: ContactsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const { language } = useSettings()
  const t = (key: keyof typeof import('@/lib/i18n').translations.en) => getTranslation(language, key)

  const filteredUsers = users
    .filter(u => u.id !== currentUser.id)
    .filter(u => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        u.full_name.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query) ||
        u.department?.toLowerCase().includes(query) ||
        u.title?.toLowerCase().includes(query)
      )
    })

  const usersByDepartment = filteredUsers.reduce((acc, user) => {
    const dept = user.department || 'Other'
    if (!acc[dept]) acc[dept] = []
    acc[dept].push(user)
    return acc
  }, {} as Record<string, User[]>)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'busy': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    const statusKey = status as 'online' | 'away' | 'busy' | 'offline'
    return t(statusKey)
  }

  return (
    <div className="flex h-full">
      {/* Contacts list */}
      <div className="w-80 border-r flex flex-col">
        <div className="border-b p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('contacts')}</h2>
            <Button size="icon" variant="ghost">
              <UserPlus className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchContacts')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-2">
            <TabsTrigger value="all" className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              {t('all')}
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex-1">
              <Star className="h-4 w-4 mr-2" />
              {t('favorites')}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="all" className="m-0">
              {Object.entries(usersByDepartment).map(([department, deptUsers]) => (
                <div key={department} className="p-2">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    {department}
                    <Badge variant="secondary" className="ml-auto">
                      {deptUsers.length}
                    </Badge>
                  </div>
                  {deptUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent',
                        selectedUser?.id === user.id && 'bg-accent'
                      )}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>
                            {user.full_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className={cn('absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background', getStatusColor(user.status))} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{user.full_name}</div>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.title}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </TabsContent>

            <TabsContent value="favorites" className="m-0 p-4">
              <div className="text-center text-muted-foreground py-8">
                <Star className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>{t('noFavoriteContacts')}</p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Contact details */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="border-b p-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedUser.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl">
                      {selectedUser.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className={cn('absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-background', getStatusColor(selectedUser.status))} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-1">
                    {selectedUser.full_name}
                  </h2>
                  <p className="text-muted-foreground mb-2">{selectedUser.title}</p>
                  <Badge variant="secondary">
                    {getStatusText(selectedUser.status)}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button 
                  className="flex-1"
                  onClick={() => onStartChat(selectedUser.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {t('message')}
                </Button>
                <Button variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  {t('call')}
                </Button>
                <Button variant="outline">
                  <Video className="h-4 w-4 mr-2" />
                  {t('video')}
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-sm font-semibold mb-3">{t('contactInformation')}</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">{t('email')}</label>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    {selectedUser.phone && (
                      <div>
                        <label className="text-sm text-muted-foreground">{t('phone')}</label>
                        <p className="font-medium">{selectedUser.phone}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm text-muted-foreground">{t('username')}</label>
                      <p className="font-medium">@{selectedUser.username}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">{t('workInformation')}</h3>
                  <div className="space-y-3">
                    {selectedUser.department && (
                      <div>
                        <label className="text-sm text-muted-foreground">{t('department')}</label>
                        <p className="font-medium">{selectedUser.department}</p>
                      </div>
                    )}
                    {selectedUser.title && (
                      <div>
                        <label className="text-sm text-muted-foreground">{t('title')}</label>
                        <p className="font-medium">{selectedUser.title}</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedUser.status_message && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">{t('status')}</h3>
                    <p className="text-muted-foreground">{selectedUser.status_message}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-semibold mb-2">{t('noContactSelected')}</h3>
              <p>{t('selectContactToViewDetails')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
