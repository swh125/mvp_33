'use client'

import { Button } from '@/components/ui/button'
import { Languages, Moon, Sun } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSettings } from '@/lib/settings-context'
import { cn } from '@/lib/utils'

export function SettingsSwitcher() {
  const { language, theme, setLanguage, setTheme, t } = useSettings()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="relative">
          {theme === 'light' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{t('preferences')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {t('language')}
        </DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={() => setLanguage('en')}
          className={cn('gap-2', language === 'en' && 'bg-accent')}
        >
          <Languages className="h-4 w-4" />
          <span>English</span>
          {language === 'en' && (
            <span className="ml-auto text-primary">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage('zh')}
          className={cn('gap-2', language === 'zh' && 'bg-accent')}
        >
          <Languages className="h-4 w-4" />
          <span>中文</span>
          {language === 'zh' && (
            <span className="ml-auto text-primary">✓</span>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {t('theme')}
        </DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={cn('gap-2', theme === 'light' && 'bg-accent')}
        >
          <Sun className="h-4 w-4" />
          <span>{t('light')}</span>
          {theme === 'light' && (
            <span className="ml-auto text-primary">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={cn('gap-2', theme === 'dark' && 'bg-accent')}
        >
          <Moon className="h-4 w-4" />
          <span>{t('dark')}</span>
          {theme === 'dark' && (
            <span className="ml-auto text-primary">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
