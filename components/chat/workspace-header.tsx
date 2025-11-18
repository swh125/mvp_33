'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Workspace } from '@/lib/types'
import { Building2, ChevronDown, Settings, LogOut, Bell, Hash, UsersIcon, MessageSquare } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { mockAuth } from '@/lib/mock-auth'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SettingsSwitcher } from '@/components/settings/settings-switcher'
import { useSettings } from '@/lib/settings-context'

interface WorkspaceHeaderProps {
  workspace: Workspace
  currentUser: User
}

export function WorkspaceHeader({ workspace, currentUser }: WorkspaceHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useSettings()

  const handleLogout = () => {
    mockAuth.logout()
    router.push('/login')
  }

  const navItems = [
    { label: t('messages'), icon: MessageSquare, path: '/chat' },
    { label: t('channels'), icon: Hash, path: '/channels' },
    { label: t('contacts'), icon: UsersIcon, path: '/contacts' },
  ]

  return (
    <div className="border-b bg-background">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  {workspace.logo_url ? (
                    <img 
                      src={workspace.logo_url || "/placeholder.svg"} 
                      alt={workspace.name}
                      className="h-6 w-6 rounded"
                    />
                  ) : (
                    <Building2 className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">{workspace.name}</div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <div className="px-2 py-2">
                <div className="font-semibold">{workspace.name}</div>
                <div className="text-sm text-muted-foreground">
                  {workspace.domain}.chat
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                {t('workspaceSettings')}
              </DropdownMenuItem>
              <DropdownMenuItem>
                {t('invitePeople')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t('signOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path
              return (
                <Button
                  key={item.path}
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => router.push(item.path)}
                  className={cn('gap-2', isActive && 'font-medium')}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost">
            <Bell className="h-5 w-5" />
          </Button>
          <SettingsSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    {currentUser.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-2">
                <div className="font-semibold">{currentUser.full_name}</div>
                <div className="text-sm text-muted-foreground">
                  {currentUser.title}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{t('profileSettings')}</DropdownMenuItem>
              <DropdownMenuItem>{t('preferences')}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t('signOut')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
