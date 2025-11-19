import { NextRequest, NextResponse } from 'next/server'
import { mockMessageService } from '@/lib/mock-messages'

// POST /api/messages/[messageId]/reactions - Add reaction
export async function POST(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const body = await request.json()
    const { emoji, userId } = body

    if (!emoji || !userId) {
      return NextResponse.json(
        { error: 'emoji and userId are required' },
        { status: 400 }
      )
    }

    const message = mockMessageService.addReaction(params.messageId, emoji, userId)

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error) {
    console.error('Add reaction error:', error)
    return NextResponse.json(
      { error: 'Failed to add reaction' },
      { status: 500 }
    )
  }
}

// DELETE /api/messages/[messageId]/reactions - Remove reaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams
    const emoji = searchParams.get('emoji')
    const userId = searchParams.get('userId')

    if (!emoji || !userId) {
      return NextResponse.json(
        { error: 'emoji and userId are required' },
        { status: 400 }
      )
    }

    const message = mockMessageService.removeReaction(params.messageId, emoji, userId)

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error) {
    console.error('Remove reaction error:', error)
    return NextResponse.json(
      { error: 'Failed to remove reaction' },
      { status: 500 }
    )
  }
}

