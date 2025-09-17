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
    const existingByEmail = await mockEnv.WAITING_LIST.get(email)
    const existingByWallet = await mockEnv.WAITING_LIST.get(`wallet:${walletAddress}`)
    
    if (existingByEmail) {
      return c.json({ error: 'Email already registered' }, 409)
    }
    
    if (existingByWallet) {
      return c.json({ error: 'Wallet address already registered' }, 409)
    }
    
    // Save to mock KV store
    const userData = {
      email,
      walletAddress,
      signature,
      network: network || 'unknown',
      joinedAt: new Date().toISOString(),
      position: await getNextPosition(mockEnv.WAITING_LIST)
    }
    
    // Store by email and wallet address for duplicate checking
    await mockEnv.WAITING_LIST.put(email, JSON.stringify(userData))
    await mockEnv.WAITING_LIST.put(`wallet:${walletAddress}`, JSON.stringify(userData))
    await mockEnv.WAITING_LIST.put(`position:${userData.position}`, email)
    
    return c.json({ 
      message: 'Successfully joined waiting list',
      position: userData.position,
      email: userData.email,
      walletAddress: userData.walletAddress
    })
  } catch (error) {
    console.error('Waitlist registration error:', error)
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
