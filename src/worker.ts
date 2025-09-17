/**
 * Cloudflare Worker for vite-shadcn-template
 *
 * This worker serves the SPA and provides optional API endpoints.
 * The SPA assets are automatically served by Cloudflare's asset handling
 * with single-page-application mode enabled.
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { renderEmailTemplate } from './config/email-templates'

// Define the Cloudflare environment interface
interface Env {
  ASSETS: Fetcher
  ENVIRONMENT: string
  WAITING_LIST: KVNamespace
  // Email configuration
  RESEND_API_KEY?: string
  FROM_EMAIL?: string
}

const app = new Hono<{ Bindings: Env }>()

// Enable CORS for all routes
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

// API Routes for Waiting List
app.post('/api/waitlist', async (c) => {
  try {
    const { email, walletAddress, signature, network } = await c.req.json()
    
    if (!email || !walletAddress || !signature) {
      return c.json({ error: 'Email, wallet address, and signature are required' }, 400)
    }
    
    // Basic signature validation (format check)
    if (!/^0x[a-fA-F0-9]{130}$/.test(signature)) {
      return c.json({ error: 'Invalid signature format' }, 400)
    }
    
    // Basic wallet address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return c.json({ error: 'Invalid wallet address format' }, 400)
    }
    
    // Check if email or wallet already exists
    const existingByEmail = await c.env.WAITING_LIST.get(email)
    const existingByWallet = await c.env.WAITING_LIST.get(`wallet:${walletAddress}`)
    
    if (existingByEmail) {
      return c.json({ error: 'Email already registered' }, 409)
    }
    
    if (existingByWallet) {
      return c.json({ error: 'Wallet address already registered' }, 409)
    }
    
    // Generate verification token
    const verificationToken = crypto.randomUUID()
    
    // Save to KV store with unverified status
    const userData = {
      email,
      walletAddress,
      signature,
      network: network || 'unknown',
      joinedAt: new Date().toISOString(),
      position: await getNextPosition(c.env.WAITING_LIST),
      verified: false,
      verificationToken
    }
    
    // Store by email and wallet address for duplicate checking
    await c.env.WAITING_LIST.put(email, JSON.stringify(userData))
    await c.env.WAITING_LIST.put(`wallet:${walletAddress}`, JSON.stringify(userData))
    await c.env.WAITING_LIST.put(`position:${userData.position}`, email)
    await c.env.WAITING_LIST.put(`verify:${verificationToken}`, email)
    
    // Send verification email instead of welcome email
    await sendVerificationEmail(c.env, email, verificationToken)
    
    return c.json({ 
      message: 'Successfully joined waiting list. Please check your email to verify your account.',
      position: userData.position,
      email: userData.email,
      walletAddress: userData.walletAddress,
      verified: false,
      needsVerification: true
    })
  } catch (error) {
    console.error('Waitlist registration error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Email verification endpoint
app.get('/api/verify', async (c) => {
  try {
    const token = c.req.query('token')
    
    if (!token) {
      return c.html(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>❌ Invalid Verification Link</h2>
            <p>The verification token is missing or invalid.</p>
          </body>
        </html>
      `, 400)
    }

    // Get email from verification token
    const email = await c.env.WAITING_LIST.get(`verify:${token}`)
    
    if (!email) {
      return c.html(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>❌ Invalid or Expired Token</h2>
            <p>This verification link is invalid or has already been used.</p>
          </body>
        </html>
      `, 400)
    }

    // Get user data and update verification status
    const userDataStr = await c.env.WAITING_LIST.get(email)
    if (!userDataStr) {
      return c.html(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>❌ User Not Found</h2>
            <p>User data not found.</p>
          </body>
        </html>
      `, 404)
    }

    const userData = JSON.parse(userDataStr)
    userData.verified = true
    userData.verifiedAt = new Date().toISOString()

    // 📊 DEBUG: Log verification status update
    console.log(`✅ EMAIL VERIFICATION UPDATE:`, {
      email: email,
      position: userData.position,
      walletAddress: userData.walletAddress,
      verified: userData.verified,
      verifiedAt: userData.verifiedAt
    })

    // Update user data
    await c.env.WAITING_LIST.put(email, JSON.stringify(userData))
    await c.env.WAITING_LIST.put(`wallet:${userData.walletAddress}`, JSON.stringify(userData))
    
    // 📊 DEBUG: Confirm data was saved
    console.log(`💾 KV UPDATE COMPLETED for email: ${email}`)
    
    // Remove verification token (one-time use)
    await c.env.WAITING_LIST.delete(`verify:${token}`)
    
    // Send welcome email after verification
    await sendWelcomeEmail(c.env, email, userData.position)

    return c.html(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2>✅ Email Verified Successfully!</h2>
          <p>Welcome to the waiting list! Your email has been verified.</p>
          <p>🎯 Your position: <strong>#${userData.position}</strong></p>
          <p>📧 A welcome email has been sent to your inbox.</p>
          <div style="margin-top: 30px;">
            <a href="https://waiting-list.jhfnetboy.workers.dev" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
              🌲 Return to Waiting List
            </a>
          </div>
        </body>
      </html>
    `)
  } catch (error) {
    console.error('Verification error:', error)
    return c.html(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2>❌ Verification Failed</h2>
          <p>An error occurred during verification. Please try again.</p>
        </body>
      </html>
    `, 500)
  }
})

app.get('/api/waitlist/:email', async (c) => {
  try {
    const email = c.req.param('email')
    const userData = await c.env.WAITING_LIST.get(email)
    
    if (!userData) {
      return c.json({ error: 'Email not found' }, 404)
    }
    
    const user = JSON.parse(userData)
    
    // 📊 DEBUG: Log user verification status query
    console.log(`🔍 USER VERIFICATION STATUS QUERY:`, {
      email: user.email,
      position: user.position,
      verified: user.verified,
      verifiedAt: user.verifiedAt,
      hasVerificationToken: !!user.verificationToken
    })
    
    return c.json({
      email: user.email,
      position: user.position,
      joinedAt: user.joinedAt,
      verified: user.verified || false,
      verifiedAt: user.verifiedAt || null,
      walletAddress: user.walletAddress,
      network: user.network,
      message: `You are #${user.position} in the waiting list${user.verified ? ' (Verified ✅)' : ' (Unverified ⚠️)'}`
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Admin authentication middleware
const authenticateAdmin = async (c: unknown, password: string) => {
  const adminPassword = c.env.ADMIN_PASSWORD || 'admin123'
  return password === adminPassword
}

// Admin login endpoint
app.post('/api/admin/login', async (c) => {
  try {
    const { password } = await c.req.json()
    
    if (!password) {
      return c.json({ error: 'Password required' }, 400)
    }
    
    const isValid = await authenticateAdmin(c, password)
    
    if (isValid) {
      return c.json({ success: true })
    } else {
      return c.json({ error: 'Invalid password' }, 401)
    }
  } catch (error) {
    console.error('Admin login error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Admin users endpoint with pagination
app.get('/api/admin/users', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const password = authHeader?.replace('Bearer ', '')
    
    if (!password || !(await authenticateAdmin(c, password))) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '10')
    const offset = (page - 1) * limit
    
    // Get all user emails (not position or verify keys)
    const list = await c.env.WAITING_LIST.list()
    const userEmails = list.keys
      .filter(key => 
        key.name.includes('@') && 
        !key.name.startsWith('position:') && 
        !key.name.startsWith('verify:') && 
        !key.name.startsWith('wallet:')
      )
      .sort((a, b) => a.name.localeCompare(b.name))
    
    const totalUsers = userEmails.length
    const paginatedEmails = userEmails.slice(offset, offset + limit)
    
    // Fetch user data
    const users = await Promise.all(
      paginatedEmails.map(async (key) => {
        const userData = await c.env.WAITING_LIST.get(key.name)
        return userData ? JSON.parse(userData) : null
      })
    )
    
    const validUsers = users.filter(Boolean).sort((a, b) => a.position - b.position)
    
    return c.json({
      users: validUsers,
      total: totalUsers,
      page,
      limit,
      totalPages: Math.ceil(totalUsers / limit)
    })
  } catch (error) {
    console.error('Admin users error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Admin stats endpoint
app.get('/api/admin/stats', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    const password = authHeader?.replace('Bearer ', '')
    
    if (!password || !(await authenticateAdmin(c, password))) {
      return c.json({ error: 'Unauthorized' }, 401)
    }
    
    // Get all user emails
    const list = await c.env.WAITING_LIST.list()
    const userEmails = list.keys.filter(key => 
      key.name.includes('@') && 
      !key.name.startsWith('position:') && 
      !key.name.startsWith('verify:') && 
      !key.name.startsWith('wallet:')
    )
    
    // Fetch all user data for stats
    const allUsers = await Promise.all(
      userEmails.map(async (key) => {
        const userData = await c.env.WAITING_LIST.get(key.name)
        return userData ? JSON.parse(userData) : null
      })
    )
    
    const validUsers = allUsers.filter(Boolean)
    const verifiedUsers = validUsers.filter(user => user.verified)
    const unverifiedUsers = validUsers.filter(user => !user.verified)
    
    // Network statistics
    const networkStats: Record<string, number> = {}
    validUsers.forEach(user => {
      const network = user.network || 'unknown'
      networkStats[network] = (networkStats[network] || 0) + 1
    })
    
    return c.json({
      totalUsers: validUsers.length,
      verifiedUsers: verifiedUsers.length,
      unverifiedUsers: unverifiedUsers.length,
      networkStats
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.get('/api/waitlist', async (c) => {
  try {
    // Get total count (simplified - in production you'd want better pagination)
    const list = await c.env.WAITING_LIST.list({ prefix: 'position:' })
    const total = list.keys.length
    
    return c.json({ total })
  } catch (error) {
    console.error('Error getting total count:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

async function getNextPosition(kv: KVNamespace): Promise<number> {
  const list = await kv.list({ prefix: 'position:' })
  return list.keys.length + 1
}

// Email verification function using Resend
async function sendVerificationEmail(env: Env, email: string, token: string): Promise<boolean> {
  // Skip if no API key configured
  if (!env.RESEND_API_KEY) {
    console.log('🔴 EMAIL DEBUG: Resend API key not configured, skipping verification email')
    return false
  }

  console.log('📧 EMAIL DEBUG: Starting verification email send process')
  console.log('📧 EMAIL DEBUG: Target email:', email)
  console.log('📧 EMAIL DEBUG: Token:', token.substring(0, 8) + '...')
  console.log('📧 EMAIL DEBUG: FROM_EMAIL:', env.FROM_EMAIL || 'Waiting List <noreply@yourdomain.com>')

  try {
    const verifyUrl = `https://waiting-list.jhfnetboy.workers.dev/api/verify?token=${token}`
    console.log('📧 EMAIL DEBUG: Verification URL:', verifyUrl)
    
    // Render email template with variables
    const emailContent = renderEmailTemplate('verification', {
      VERIFICATION_LINK: verifyUrl,
      EMAIL_ADDRESS: email
    })
    
    const emailPayload = {
      from: env.FROM_EMAIL || 'Waiting List <noreply@aastar.io>',
      to: [email],
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    }

    console.log('📧 EMAIL DEBUG: Email payload prepared, making API request...')
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    })

    console.log('📧 EMAIL DEBUG: API response status:', response.status)
    console.log('📧 EMAIL DEBUG: API response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('🔴 EMAIL DEBUG: Failed to send verification email')
      console.error('🔴 EMAIL DEBUG: Status:', response.status)
      console.error('🔴 EMAIL DEBUG: Error response:', errorText)
      return false
    }

    const responseData = await response.json()
    console.log('✅ EMAIL DEBUG: Verification email sent successfully!')
    console.log('✅ EMAIL DEBUG: Response data:', responseData)
    console.log('✅ EMAIL DEBUG: Email sent to:', email)
    return true
  } catch (error) {
    console.error('🔴 EMAIL DEBUG: Exception during email send:', error)
    console.error('🔴 EMAIL DEBUG: Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return false
  }
}

// Email sending function using Resend
async function sendWelcomeEmail(env: Env, email: string, position: number): Promise<boolean> {
  // If Resend API key is not configured, skip email sending
  if (!env.RESEND_API_KEY) {
    console.log('Resend API key not configured, skipping email')
    return true
  }

  try {
    // Render email template with variables
    const emailContent = renderEmailTemplate('welcome', {
      POSITION: position.toString(),
      EMAIL_ADDRESS: email
    })

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL || 'Waiting List <noreply@aastar.io>',
        to: [email],
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      }),
    })

    if (response.ok) {
      console.log('Welcome email sent successfully to:', email)
      return true
    } else {
      const error = await response.text()
      console.error('Failed to send email:', error)
      return false
    }
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

// Catch-all route for SPA
// This will only be reached if the request doesn't match any static assets
// and doesn't match any of the API routes above
app.get('*', async () => {
  // For navigation requests, let Cloudflare handle SPA routing automatically
  // This fallback is mainly for non-navigation requests that don't match assets
  return new Response('Not Found', { status: 404 })
})

export default app
