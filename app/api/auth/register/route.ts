import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // TODO: In production, you would:
    // 1. Check if user already exists in database
    // 2. Hash the password using bcrypt or similar
    // 3. Create user in database
    // 4. Generate JWT token
    // 5. Return user data and token

    // For now, simulate API call
    const user = {
      id: `user_${Date.now()}`,
      email,
      username: email.split('@')[0],
      full_name: name,
      avatar_url: null,
      department: null,
      title: null,
      status: 'online',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Simulate token generation
    const token = `token_${Date.now()}_${Math.random().toString(36).substring(7)}`

    return NextResponse.json({
      success: true,
      user,
      token,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}

