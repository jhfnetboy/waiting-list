/**
 * Cloudflare Worker for vite-shadcn-template
 *
 * This worker serves the SPA and provides optional API endpoints.
 * The SPA assets are automatically served by Cloudflare's asset handling
 * with single-page-application mode enabled.
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'

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
    const { email } = await c.req.json()
    
    if (!email) {
      return c.json({ error: 'Email is required' }, 400)
    }
    
    // Check if email already exists
    const existing = await c.env.WAITING_LIST.get(email)
    if (existing) {
      return c.json({ error: 'Email already registered' }, 409)
    }
    
    // Save to KV store
    const userData = {
      email,
      joinedAt: new Date().toISOString(),
      position: await getNextPosition(c.env.WAITING_LIST)
    }
    
    await c.env.WAITING_LIST.put(email, JSON.stringify(userData))
    await c.env.WAITING_LIST.put(`position:${userData.position}`, email)
    
    // Send welcome email
    await sendWelcomeEmail(c.env, email, userData.position)
    
    return c.json({ 
      message: 'Successfully joined waiting list',
      position: userData.position,
      email: userData.email
    })
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500)
  }
})

app.get('/api/waitlist/:email', async (c) => {
  try {
    const email = c.req.param('email')
    const userData = await c.env.WAITING_LIST.get(email)
    
    if (!userData) {
      return c.json({ error: 'Email not found' }, 404)
    }
    
    return c.json(JSON.parse(userData))
  } catch (error) {
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
    return c.json({ error: 'Internal server error' }, 500)
  }
})

async function getNextPosition(kv: KVNamespace): Promise<number> {
  const list = await kv.list({ prefix: 'position:' })
  return list.keys.length + 1
}

// Email sending function using Resend
async function sendWelcomeEmail(env: Env, email: string, position: number): Promise<boolean> {
  // If Resend API key is not configured, skip email sending
  if (!env.RESEND_API_KEY) {
    console.log('Resend API key not configured, skipping email')
    return true
  }

  try {
    const subject = 'Welcome to our Waiting List! 🎉'
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .position { font-size: 24px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 You're on the list!</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p>Thank you for joining our waiting list! We're excited to have you on board.</p>
            
            <div class="position">
              You are #${position} in line
            </div>
            
            <p>We'll notify you as soon as we launch. In the meantime, feel free to follow our progress and updates.</p>
            
            <p>Best regards,<br>
            The Team</p>
          </div>
          <div class="footer">
            <p>This email was sent because you joined our waiting list.<br>
            If you have any questions, please contact us.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL || 'Waiting List <noreply@yourdomain.com>',
        to: [email],
        subject: subject,
        html: htmlBody,
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
