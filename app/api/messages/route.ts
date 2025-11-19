import { NextRequest, NextResponse } from 'next/server'
import { mockMessageService } from '@/lib/mock-messages'

// GET /api/messages?conversationId=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      )
    }

    const messages = mockMessageService.getMessages(conversationId)
    
    return NextResponse.json({
      success: true,
      messages,
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    )
  }
}

// POST /api/messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, senderId, content, type = 'text', file } = body

    if (!conversationId || !senderId || !content) {
      return NextResponse.json(
        { error: 'conversationId, senderId, and content are required' },
        { status: 400 }
      )
    }

    // In production, handle file upload here
    const message = mockMessageService.sendMessage(
      conversationId,
      senderId,
      content,
      type,
      file
    )

    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

