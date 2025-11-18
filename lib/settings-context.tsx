'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'zh'
type Theme = 'light' | 'dark'

interface SettingsContextType {
  language: Language
  theme: Theme
  setLanguage: (language: Language) => void
  setTheme: (theme: Theme) => void
  t: (key: string) => string
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [theme, setThemeState] = useState<Theme>('light')

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language
    const savedTheme = localStorage.getItem('theme') as Theme
    
    if (savedLanguage) setLanguageState(savedLanguage)
    if (savedTheme) {
      setThemeState(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    }
  }, [])

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const t = (key: string): string => {
    const translations: Record<Language, Record<string, string>> = {
      en: {
        messages: 'Messages',
        channels: 'Channels',
        contacts: 'Contacts',
        workspaceSettings: 'Workspace settings',
        invitePeople: 'Invite people',
        signOut: 'Sign out',
        profileSettings: 'Profile settings',
        preferences: 'Preferences',
        notifications: 'Notifications',
        language: 'Language',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
      },
      zh: {
        messages: '消息',
        channels: '频道',
        contacts: '通讯录',
        workspaceSettings: '工作区设置',
        invitePeople: '邀请成员',
        signOut: '退出登录',
        profileSettings: '个人设置',
        preferences: '偏好设置',
        notifications: '通知',
        language: '语言',
        theme: '主题',
        light: '浅色',
        dark: '深色',
      }
    }
    
    return translations[language]?.[key] || key
  }

  return (
    <SettingsContext.Provider value={{ language, theme, setLanguage, setTheme, t }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
