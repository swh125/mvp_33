import { NextRequest, NextResponse } from 'next/server'

const WECHAT_APP_ID = process.env.WECHAT_APP_ID || ''
const WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET || ''
const WECHAT_REDIRECT_URI = process.env.WECHAT_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/oauth/wechat/callback`
const FRONTEND_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

/**
 * Handle WeChat OAuth callback
 * GET /api/auth/oauth/wechat/callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state') || ''
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(`${FRONTEND_URL}/login?error=oauth_cancelled`)
    }

    if (!code) {
      return NextResponse.redirect(`${FRONTEND_URL}/login?error=oauth_failed`)
    }

    // Extract action from state (login or register)
    const action = state.split('_')[0] || 'login'

    // Exchange authorization code for access token
    const tokenUrl = new URL('https://api.weixin.qq.com/sns/oauth2/access_token')
    tokenUrl.searchParams.set('appid', WECHAT_APP_ID)
    tokenUrl.searchParams.set('secret', WECHAT_APP_SECRET)
    tokenUrl.searchParams.set('code', code)
    tokenUrl.searchParams.set('grant_type', 'authorization_code')

    const tokenResponse = await fetch(tokenUrl.toString(), {
      method: 'GET',
    })

    if (!tokenResponse.ok) {
      return NextResponse.redirect(`${FRONTEND_URL}/login?error=token_exchange_failed`)
    }

    const tokenData = await tokenResponse.json()

    if (tokenData.errcode) {
      return NextResponse.redirect(`${FRONTEND_URL}/login?error=wechat_error&message=${tokenData.errmsg}`)
    }

    const { access_token, openid } = tokenData

    // Get user info from WeChat
    const userInfoUrl = new URL('https://api.weixin.qq.com/sns/userinfo')
    userInfoUrl.searchParams.set('access_token', access_token)
    userInfoUrl.searchParams.set('openid', openid)
    userInfoUrl.searchParams.set('lang', 'zh_CN')

    const userInfoResponse = await fetch(userInfoUrl.toString(), {
      method: 'GET',
    })

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(`${FRONTEND_URL}/login?error=user_info_failed`)
    }

    const wechatUser = await userInfoResponse.json()

    if (wechatUser.errcode) {
      return NextResponse.redirect(`${FRONTEND_URL}/login?error=wechat_error&message=${wechatUser.errmsg}`)
    }

    // TODO: In production, you would:
    // 1. Check if user exists in database by wechat_openid or unionid
    // 2. If registering (action === 'register') and user exists, return error
    // 3. If logging in (action === 'login') and user doesn't exist, return error
    // 4. Create or update user in database
    // 5. Generate JWT token
    // 6. Set token in HTTP-only cookie or return to frontend

    // For now, create user object
    const user = {
      id: `wechat_${openid}`,
      email: wechatUser.email || `${openid}@wechat.user`, // WeChat may not provide email
      username: wechatUser.nickname || `wechat_${openid.substring(0, 8)}`,
      full_name: wechatUser.nickname || 'WeChat User',
      avatar_url: wechatUser.headimgurl || null,
      department: null,
      title: null,
      status: 'online',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      provider: 'wechat',
      provider_id: openid,
      unionid: wechatUser.unionid || null, // UnionID for cross-platform identification
    }

    // Generate token (in production, use JWT)
    const token = `token_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Redirect to frontend with token and user data
    const redirectUrl = new URL(`${FRONTEND_URL}/login`)
    redirectUrl.searchParams.set('oauth', 'success')
    redirectUrl.searchParams.set('provider', 'wechat')
    redirectUrl.searchParams.set('token', token)
    redirectUrl.searchParams.set('user', JSON.stringify(user))

    return NextResponse.redirect(redirectUrl.toString())
  } catch (error) {
    console.error('WeChat OAuth callback error:', error)
    return NextResponse.redirect(`${FRONTEND_URL}/login?error=oauth_callback_failed`)
  }
}

