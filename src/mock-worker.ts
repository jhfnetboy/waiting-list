/**
 * Mock Worker for local development
 * Simulates Cloudflare KV with in-memory storage
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Mock KV store using Map
const mockKV = new Map<string, string>()

// Mock KV interface
const mockKVNamespace = {
  async get(key: string): Promise<string | null> {
    return mockKV.get(key) || null
  },
  
  async put(key: string, value: string): Promise<void> {
    mockKV.set(key, value)
  },
  
  async list(options?: { prefix?: string }): Promise<{ keys: Array<{ name: string }> }> {
    const keys = Array.from(mockKV.keys())
    const filteredKeys = options?.prefix 
      ? keys.filter(key => key.startsWith(options.prefix!))
      : keys
    
    return {
      keys: filteredKeys.map(name => ({ name }))
    }
  }
}

// Mock environment for local development
const mockEnv = {
  ASSETS: {} as Fetcher,
  ENVIRONMENT: 'development',
  WAITING_LIST: mockKVNamespace
}

const app = new Hono()

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
    const { email, name } = await c.req.json()
    
    if (!email || !name) {
      return c.json({ error: 'Email and name are required' }, 400)
    }
    
    // Check if email already exists
    const existing = await mockEnv.WAITING_LIST.get(email)
    if (existing) {
      return c.json({ error: 'Email already registered' }, 409)
    }
    
    // Save to mock KV store
    const userData = {
      email,
      name,
      joinedAt: new Date().toISOString(),
      position: await getNextPosition(mockEnv.WAITING_LIST)
    }
    
    await mockEnv.WAITING_LIST.put(email, JSON.stringify(userData))
    await mockEnv.WAITING_LIST.put(`position:${userData.position}`, email)
    
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
    const userData = await mockEnv.WAITING_LIST.get(email)
    
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
    // Get total count
    const list = await mockEnv.WAITING_LIST.list({ prefix: 'position:' })
    const total = list.keys.length
    
    return c.json({ total })
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500)
  }
})

async function getNextPosition(kv: typeof mockKVNamespace): Promise<number> {
  const list = await kv.list({ prefix: 'position:' })
  return list.keys.length + 1
}

// Catch-all route for SPA
app.get('*', async () => {
  return new Response('Not Found', { status: 404 })
})

export default app
