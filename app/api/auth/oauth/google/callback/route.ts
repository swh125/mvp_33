import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const FRONTEND_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

/**
 * Handle Google OAuth callback from Supabase
 * GET /api/auth/oauth/google/callback
 */
export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.redirect(`${FRONTEND_URL}/login?error=supabase_not_configured`)
    }

    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const action = searchParams.get('action') || 'login'
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(`${FRONTEND_URL}/login?error=oauth_cancelled`)
    }

    if (!code) {
      return NextResponse.redirect(`${FRONTEND_URL}/login?error=oauth_failed`)
    }

    // Exchange code for session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError || !data.session || !data.user) {
      console.error('Supabase session exchange error:', exchangeError)
      return NextResponse.redirect(`${FRONTEND_URL}/login?error=session_exchange_failed`)
    }

    const { user, session } = data

    // Transform Supabase user to our user format
    const userData = {
      id: user.id,
      email: user.email || '',
      username: user.email?.split('@')[0] || user.id.substring(0, 8),
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      department: null,
      title: null,
      status: 'online',
      created_at: user.created_at,
      updated_at: new Date().toISOString(),
      provider: 'google',
      provider_id: user.id,
    }

    // Store session token
    const token = session.access_token

    // Redirect to frontend with user data
    const redirectUrl = new URL(`${FRONTEND_URL}/login`)
    redirectUrl.searchParams.set('oauth', 'success')
    redirectUrl.searchParams.set('provider', 'google')
    redirectUrl.searchParams.set('token', token)
    redirectUrl.searchParams.set('user', JSON.stringify(userData))

    return NextResponse.redirect(redirectUrl.toString())
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(`${FRONTEND_URL}/login?error=oauth_callback_failed`)
  }
}
