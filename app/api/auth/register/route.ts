import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserByEmail as getSupabaseUserByEmail, createUser as createSupabaseUser } from '@/lib/database/supabase/users'
import { getUserByEmail as getCloudBaseUserByEmail, createUser as createCloudBaseUser } from '@/lib/database/cloudbase/users'
import { detectRegionFromRequest, detectIPLocation, getClientIP } from '@/lib/server/ip-detector'
import { User } from '@/lib/types'
import { toRegionAuthEmail } from '@/lib/auth/email-alias'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, clientIP: frontendIP } = body

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

    // Get IP: Priority 1 = frontend detected IP, Priority 2 = server detected IP
    // Frontend IP is more accurate because it can detect VPN/real IP directly
    const serverIP = getClientIP(request)
    const clientIP = frontendIP || serverIP

    console.log('[REGISTER] IP sources:', {
      frontendIP,
      serverIP,
      finalIP: clientIP,
    })

    // Detect region from IP (this determines which database to use)
    const ipLocation = await detectIPLocation(clientIP)
    const region = ipLocation.region // 'cn' or 'global'
    const country = ipLocation.country // 'CN' or null

    console.log('[REGISTER] IP detection:', { 
      ip: clientIP, 
      region, 
      country,
      isChina: ipLocation.isChina,
      source: frontendIP ? 'frontend' : 'server',
    })

    // Check if user already exists in the CURRENT region's database only
    // IMPORTANT: China and Global regions are completely independent
    // Same email can exist in both regions separately
    let existingUser: User | null = null
    if (region === 'cn') {
      existingUser = await getCloudBaseUserByEmail(email)
    } else {
      existingUser = await getSupabaseUserByEmail(email)
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // DO NOT check the other database - regions are independent!
    // Same email can be registered in both China and Global regions separately

    const supabase = await createClient()

    // Supabase Auth email: for CN region we alias to keep Supabase identities unique
    const supabaseAuthEmail = region === 'cn'
      ? toRegionAuthEmail(email, 'cn')
      : email

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: supabaseAuthEmail,
      password,
      options: {
        data: {
          full_name: name,
          username: email.split('@')[0],
        },
      },
    })

    // Handle Supabase Auth errors
    // NOTE: With region-specific auth email (aliasing for CN), the same real email
    // can safely exist in different regions. A 422 from Supabase now only means
    // "this region's auth email is already in use".
    let authUser = authData.user
    let authSession = authData.session
    
    if (authError || !authUser) {
      console.error('Supabase Auth signUp error:', {
        error: authError,
        message: authError?.message,
        status: authError?.status,
        user: authData?.user
      })
      
      // If user already exists in Supabase Auth, try to sign in instead
      // This covers the case "user clicks register again with the same password"
      if (authError?.status === 422 || authError?.message?.includes('already registered') || authError?.message?.includes('already exists')) {
        console.log('[REGISTER] Email already exists in Supabase Auth, attempting to sign in to reuse existing identity')
        
        // Try to sign in with the password to get the user (same-region re-register)
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: supabaseAuthEmail,
          password,
        })
        
        if (signInError || !signInData.user) {
          return NextResponse.json(
            { 
              error: 'Email already registered',
            },
            { status: 400 }
          )
        }
        
        // Use the existing auth user
        authUser = signInData.user
        authSession = signInData.session
        console.log('[REGISTER] Using existing Supabase Auth user for cross-region registration:', authUser.id)
      } else {
        return NextResponse.json(
          { 
            error: 'Registration failed',
          },
          { status: 400 }
        )
      }
    }

    // Create user in the appropriate database based on region
    let user: User
    try {
      // CRITICAL: Log region value and type for debugging
      console.log('[REGISTER] About to create user, region check:', {
        region,
        regionType: typeof region,
        isCn: region === 'cn',
        isGlobal: region === 'global',
        regionString: String(region),
        strictEqual: region === 'cn',
      })
      
      if (region === 'cn') {
        // China region: Store in CloudBase
        console.log('[REGISTER] Creating user in CloudBase (region is cn)')
        user = await createCloudBaseUser({
          id: authUser.id, // Use authUser instead of authData.user
          email, // Store real email for UI/notifications
          username: email.split('@')[0],
          full_name: name,
          avatar_url: null,
          region: 'cn',
          country: country,
        }, {
          auth_email: supabaseAuthEmail,
        })
        console.log('[REGISTER] User created in CloudBase:', user.id)
        
        // IMPORTANT: Supabase trigger automatically creates user in public.users
        // We need to delete it since this user should only be in CloudBase
        try {
          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', authUser.id) // Use authUser instead of authData.user
          
          if (deleteError) {
            console.warn('[REGISTER] Failed to delete auto-created Supabase user (may already be deleted):', deleteError.message)
          } else {
            console.log('[REGISTER] Deleted auto-created Supabase user (user should only be in CloudBase)')
          }
        } catch (deleteErr: any) {
          console.warn('[REGISTER] Error deleting auto-created Supabase user:', deleteErr.message)
          // Don't fail registration if deletion fails
        }
      } else {
        // Global region: Store in Supabase
        console.log('[REGISTER] Creating user in Supabase (region is NOT cn, region:', region, ')')
        // Try to get user first (might be created by trigger)
        let existingUser = await getSupabaseUserByEmail(email)
        
        if (!existingUser) {
          // Create user in Supabase users table directly
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              id: authUser.id, // Use authUser instead of authData.user
              email: authUser.email!,
              username: email.split('@')[0],
              full_name: name,
              avatar_url: null,
              status: 'online',
              region: 'global',
              country: country,
            })
            .select()
            .single()

          if (insertError) {
            // If user already exists (created by trigger), fetch it
            if (insertError.code === '23505') {
              // Retry once after a short delay
              await new Promise(resolve => setTimeout(resolve, 200))
              existingUser = await getSupabaseUserByEmail(email)
              if (!existingUser) {
                throw new Error('Failed to create user record')
              }
            } else {
              throw insertError
            }
          } else {
            existingUser = newUser as User
          }
        }
        
        // Update region and country if not set
        if (existingUser && (!existingUser.region || !existingUser.country)) {
          const { data: updatedUser } = await supabase
            .from('users')
            .update({
              region: 'global',
              country: country,
            })
            .eq('id', existingUser.id)
            .select()
            .single()
          
          if (updatedUser) {
            existingUser = updatedUser as User
          }
        }
        
        user = existingUser!
        console.log('[REGISTER] User created in Supabase:', user.id)
      }
    } catch (dbError: any) {
      console.error('[REGISTER] Database error saving new user:', {
        error: dbError,
        message: dbError.message,
        code: dbError.code,
        region,
      })
      
      return NextResponse.json(
        { 
          error: 'Failed to create user record',
          details: dbError.message || 'Database error',
        },
        { status: 500 }
      )
    }

    // Get session - use authSession from signUp or signIn
    let session = authSession
    let token = session?.access_token || ''

    // If no session, try to get existing session
    if (!session) {
      const { data: sessionData } = await supabase.auth.getSession()
      session = sessionData?.session || null
      token = session?.access_token || ''
    }

    // Ensure workspace is created for new user
    // Note: For CN region, workspace creation is handled by CloudBase separately
    // For global region, create workspace in Supabase
    // IMPORTANT: Only create workspace if this is a NEW user in this region
    // If user already exists in another region, don't create duplicate workspace
    if (session && region === 'global') {
      const { data: workspaceMembers } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .limit(1)

      if (!workspaceMembers || workspaceMembers.length === 0) {
        const domain = `workspace-${user.id.substring(0, 8)}-${Date.now()}`
        const { data: newWorkspace, error: workspaceError } = await supabase
          .from('workspaces')
          .insert({
            name: 'My Workspace',
            domain,
            owner_id: user.id,
          })
          .select()
          .single()

        if (!workspaceError && newWorkspace) {
          await supabase.from('workspace_members').insert({
            workspace_id: newWorkspace.id,
            user_id: user.id,
            role: 'owner',
          })
        }
      }
    }
    
    // For CN region, workspace will be created on first conversation creation
    // (handled by conversations API)

    // Explicitly get session to ensure cookies are set
    // This is important for @supabase/ssr to properly set cookies
    const { data: finalSessionData } = await supabase.auth.getSession()
    if (finalSessionData?.session) {
      session = finalSessionData.session
      token = session.access_token
    }

    return NextResponse.json({
      success: true,
      user,
      token,
      requiresEmailConfirmation: !session,
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    )
  }
}

