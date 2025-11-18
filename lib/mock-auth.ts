// Mock authentication service (replace with real auth later)
import { User, Workspace } from './types'

const STORAGE_KEY = 'chat_app_current_user'
const WORKSPACE_KEY = 'chat_app_current_workspace'

export const mockAuth = {
  // Get current authenticated user
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  },

  // Set current user
  setCurrentUser: (user: User | null) => {
    if (typeof window === 'undefined') return
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  },

  // Get current workspace
  getCurrentWorkspace: (): Workspace | null => {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem(WORKSPACE_KEY)
    return stored ? JSON.parse(stored) : null
  },

  // Set current workspace
  setCurrentWorkspace: (workspace: Workspace | null) => {
    if (typeof window === 'undefined') return
    if (workspace) {
      localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace))
    } else {
      localStorage.removeItem(WORKSPACE_KEY)
    }
  },

  // Mock login
  login: async (email: string, password: string): Promise<User> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock user data
    const user: User = {
      id: '00000000-0000-0000-0000-000000000001',
      email,
      username: email.split('@')[0],
      full_name: 'Alice Zhang',
      avatar_url: '/placeholder.svg?height=40&width=40',
      department: 'Engineering',
      title: 'Senior Software Engineer',
      status: 'online',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    mockAuth.setCurrentUser(user)
    return user
  },

  // Logout
  logout: () => {
    mockAuth.setCurrentUser(null)
    mockAuth.setCurrentWorkspace(null)
  },
}
