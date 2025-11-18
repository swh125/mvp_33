// Mock data service for development
import { User, Workspace, WorkspaceMember, Conversation, Message, ConversationWithDetails, MessageWithSender } from './types'

// Mock users
export const mockUsers: User[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'alice@company.com',
    username: 'alice',
    full_name: 'Alice Zhang',
    avatar_url: '/placeholder.svg?height=40&width=40',
    department: 'Engineering',
    title: 'Senior Software Engineer',
    status: 'online',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'bob@company.com',
    username: 'bob',
    full_name: 'Bob Smith',
    avatar_url: '/placeholder.svg?height=40&width=40',
    department: 'Product',
    title: 'Product Manager',
    status: 'online',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'carol@company.com',
    username: 'carol',
    full_name: 'Carol Wang',
    avatar_url: '/placeholder.svg?height=40&width=40',
    department: 'Design',
    title: 'UI/UX Designer',
    status: 'away',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'david@company.com',
    username: 'david',
    full_name: 'David Lee',
    avatar_url: '/placeholder.svg?height=40&width=40',
    department: 'Engineering',
    title: 'Engineering Manager',
    status: 'online',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'emma@company.com',
    username: 'emma',
    full_name: 'Emma Brown',
    avatar_url: '/placeholder.svg?height=40&width=40',
    department: 'Marketing',
    title: 'Marketing Director',
    status: 'busy',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock workspaces
export const mockWorkspaces: Workspace[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    name: 'TechCorp',
    logo_url: '/placeholder.svg?height=50&width=50',
    domain: 'techcorp',
    owner_id: '00000000-0000-0000-0000-000000000001',
    settings: {
      allow_guest_users: false,
      max_file_size_mb: 100,
      locale: 'en',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock conversations
export const mockConversations: ConversationWithDetails[] = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    workspace_id: '10000000-0000-0000-0000-000000000001',
    type: 'channel',
    name: 'general',
    description: 'General discussion for the entire team',
    created_by: '00000000-0000-0000-0000-000000000001',
    is_private: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    last_message_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    members: mockUsers,
    unread_count: 2,
    last_message: {
      id: 'msg-1',
      conversation_id: '30000000-0000-0000-0000-000000000001',
      sender_id: '00000000-0000-0000-0000-000000000005',
      content: "Don't forget about the product launch next week!",
      type: 'text',
      reactions: [],
      is_edited: false,
      is_deleted: false,
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    workspace_id: '10000000-0000-0000-0000-000000000001',
    type: 'channel',
    name: 'engineering',
    description: 'Engineering team channel',
    created_by: '00000000-0000-0000-0000-000000000004',
    is_private: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    last_message_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    members: [mockUsers[0], mockUsers[3]],
    unread_count: 0,
    last_message: {
      id: 'msg-2',
      conversation_id: '30000000-0000-0000-0000-000000000002',
      sender_id: '00000000-0000-0000-0000-000000000004',
      content: 'Code review for PR #234 please',
      type: 'text',
      reactions: [],
      is_edited: false,
      is_deleted: false,
      created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    workspace_id: '10000000-0000-0000-0000-000000000001',
    type: 'direct',
    created_by: '00000000-0000-0000-0000-000000000001',
    is_private: true,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    last_message_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    members: [mockUsers[0], mockUsers[1]],
    unread_count: 1,
    last_message: {
      id: 'msg-3',
      conversation_id: '30000000-0000-0000-0000-000000000003',
      sender_id: '00000000-0000-0000-0000-000000000002',
      content: 'I have some time after lunch',
      type: 'text',
      reactions: [],
      is_edited: false,
      is_deleted: false,
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  },
  {
    id: '30000000-0000-0000-0000-000000000004',
    workspace_id: '10000000-0000-0000-0000-000000000001',
    type: 'group',
    name: 'Product Planning',
    description: 'Product roadmap discussions',
    created_by: '00000000-0000-0000-0000-000000000002',
    is_private: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    last_message_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    members: [mockUsers[1], mockUsers[2], mockUsers[3]],
    unread_count: 0,
    last_message: {
      id: 'msg-4',
      conversation_id: '30000000-0000-0000-0000-000000000004',
      sender_id: '00000000-0000-0000-0000-000000000002',
      content: 'Updated the roadmap document - please review',
      type: 'text',
      reactions: [],
      is_edited: false,
      is_deleted: false,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  },
]

// Get user by ID
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(u => u.id === id)
}

// Get workspace members
export const getWorkspaceMembers = (workspaceId: string): User[] => {
  return mockUsers
}

// Get user's conversations
export const getUserConversations = (userId: string, workspaceId: string): ConversationWithDetails[] => {
  return mockConversations
}
