// Mock message service
import { MessageWithSender, User } from './types'
import { getUserById } from './mock-data'

// In-memory message storage
const messageStore = new Map<string, MessageWithSender[]>()
let messageIdCounter = 0

// Initialize with demo messages
const initMessages = (conversationId: string): MessageWithSender[] => {
  const demoMessages: MessageWithSender[] = []
  
  if (conversationId === '30000000-0000-0000-0000-000000000001') {
    // General channel messages
    const alice = getUserById('00000000-0000-0000-0000-000000000001')!
    const david = getUserById('00000000-0000-0000-0000-000000000004')!
    const bob = getUserById('00000000-0000-0000-0000-000000000002')!
    const emma = getUserById('00000000-0000-0000-0000-000000000005')!

    demoMessages.push(
      {
        id: 'msg-gen-1',
        conversation_id: conversationId,
        sender_id: david.id,
        sender: david,
        content: 'Welcome everyone to TechCorp! Looking forward to working with you all.',
        type: 'text',
        reactions: [{ emoji: '👋', user_ids: ['u1', 'u2'], count: 2 }],
        is_edited: false,
        is_deleted: false,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg-gen-2',
        conversation_id: conversationId,
        sender_id: alice.id,
        sender: alice,
        content: 'Thanks David! Excited to be here!',
        type: 'text',
        reactions: [],
        is_edited: false,
        is_deleted: false,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg-gen-3',
        conversation_id: conversationId,
        sender_id: bob.id,
        sender: bob,
        content: 'Team standup at 10am today - please join!',
        type: 'text',
        reactions: [{ emoji: '✅', user_ids: ['u1', 'u2', 'u3'], count: 3 }],
        is_edited: false,
        is_deleted: false,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg-gen-4',
        conversation_id: conversationId,
        sender_id: emma.id,
        sender: emma,
        content: "Don't forget about the product launch next week!",
        type: 'text',
        reactions: [],
        is_edited: false,
        is_deleted: false,
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      }
    )
  } else if (conversationId === '30000000-0000-0000-0000-000000000003') {
    // Direct message between Alice and Bob
    const alice = getUserById('00000000-0000-0000-0000-000000000001')!
    const bob = getUserById('00000000-0000-0000-0000-000000000002')!

    demoMessages.push(
      {
        id: 'msg-dm-1',
        conversation_id: conversationId,
        sender_id: alice.id,
        sender: alice,
        content: 'Hey Bob, can we discuss the new feature requirements?',
        type: 'text',
        reactions: [],
        is_edited: false,
        is_deleted: false,
        created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg-dm-2',
        conversation_id: conversationId,
        sender_id: bob.id,
        sender: bob,
        content: 'I have some time after lunch.',
        type: 'text',
        reactions: [],
        is_edited: false,
        is_deleted: false,
        created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg-dm-3',
        conversation_id: conversationId,
        sender_id: alice.id,
        sender: alice,
        content: 'Perfect! Let me know when you are ready.',
        type: 'text',
        reactions: [],
        is_edited: false,
        is_deleted: false,
        created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      },
      {
        id: 'msg-dm-4',
        conversation_id: conversationId,
        sender_id: bob.id,
        sender: bob,
        content: 'I have some time after lunch',
        type: 'text',
        reactions: [],
        is_edited: false,
        is_deleted: false,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      }
    )
  }

  return demoMessages
}

export const mockMessageService = {
  getMessages: (conversationId: string): MessageWithSender[] => {
    if (!messageStore.has(conversationId)) {
      messageStore.set(conversationId, initMessages(conversationId))
    }
    return messageStore.get(conversationId) || []
  },

  getMessageById: (messageId: string): MessageWithSender | null => {
    for (const messages of messageStore.values()) {
      const message = messages.find(m => m.id === messageId)
      if (message) return message
    }
    return null
  },

  sendMessage: (
    conversationId: string, 
    senderId: string, 
    content: string, 
    type: string = 'text',
    file?: File
  ): MessageWithSender => {
    const sender = getUserById(senderId)
    if (!sender) throw new Error('Sender not found')

    // Generate unique message ID using high-resolution time for <1ms speed
    messageIdCounter++
    const now = performance.now()
    const messageId = `msg-${now}-${messageIdCounter}`

    const newMessage: MessageWithSender = {
      id: messageId,
      conversation_id: conversationId,
      sender_id: senderId,
      sender,
      content,
      type: type as any,
      reactions: [],
      is_edited: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: file ? {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_url: URL.createObjectURL(file),
        thumbnail_url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      } : undefined,
    }

    const messages = mockMessageService.getMessages(conversationId)
    messages.push(newMessage)
    messageStore.set(conversationId, messages)

    return newMessage
  },

  editMessage: (messageId: string, content: string): MessageWithSender | null => {
    const message = mockMessageService.getMessageById(messageId)
    if (!message) return null

    message.content = content
    message.is_edited = true
    message.updated_at = new Date().toISOString()

    return message
  },

  deleteMessage: (messageId: string): MessageWithSender | null => {
    const message = mockMessageService.getMessageById(messageId)
    if (!message) return null

    message.is_deleted = true
    message.content = 'This message has been deleted'
    message.updated_at = new Date().toISOString()

    return message
  },

  addReaction: (messageId: string, emoji: string, userId: string): MessageWithSender | null => {
    const message = mockMessageService.getMessageById(messageId)
    if (!message) return null

    const existingReaction = message.reactions.find(r => r.emoji === emoji)
    if (existingReaction) {
      if (!existingReaction.user_ids.includes(userId)) {
        existingReaction.user_ids.push(userId)
        existingReaction.count = existingReaction.user_ids.length
      }
    } else {
      message.reactions.push({
        emoji,
        user_ids: [userId],
        count: 1,
      })
    }

    message.updated_at = new Date().toISOString()
    return message
  },

  removeReaction: (messageId: string, emoji: string, userId: string): MessageWithSender | null => {
    const message = mockMessageService.getMessageById(messageId)
    if (!message) return null

    const reaction = message.reactions.find(r => r.emoji === emoji)
    if (reaction) {
      reaction.user_ids = reaction.user_ids.filter(id => id !== userId)
      reaction.count = reaction.user_ids.length

      if (reaction.count === 0) {
        message.reactions = message.reactions.filter(r => r.emoji !== emoji)
      }
    }

    message.updated_at = new Date().toISOString()
    return message
  },
}
