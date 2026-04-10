import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { sign, verify } from 'hono/jwt'

const app = new Hono()

// Apply CORS to all routes
app.use('*', cors({
  origin: '*', // Restrict this to the vercel frontend URL in production
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Utility: Hash password using Web Crypto API
async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

const JWT_SECRET = 'seize-super-secret-key-change-in-prod' // Move to secrets in prod

// Auth Middleware
app.use('/api/protected/*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const token = authHeader.split(' ')[1]
  try {
    const payload = await verify(token, JWT_SECRET)
    c.set('user', payload)
    await next()
  } catch (e) {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }
})

// --- PUBLIC ROUTES ---

// Health check
app.get('/', (c) => c.json({ status: 'ok', app: 'Seize Worker API' }))

// Register Route
app.post('/api/auth/register', async (c) => {
  try {
    const body = await c.req.json()
    const { username, password } = body

    if (!username || !password) {
      return c.json({ error: 'Username and password required' }, 400)
    }

    const hashed = await hashPassword(password)
    
    const db = c.env.DB
    const result = await db.prepare(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)'
    ).bind(username, hashed).run()

    if (result.success) {
      return c.json({ message: 'User registered successfully' }, 201)
    } else {
      return c.json({ error: 'Registration failed' }, 500)
    }
  } catch (error) {
    // Unique constraint violation (username already exists)
    if (error.message.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'Username already taken' }, 409)
    }
    return c.json({ error: error.message }, 500)
  }
})

// Login Route
app.post('/api/auth/login', async (c) => {
  try {
    const body = await c.req.json()
    const { username, password } = body

    if (!username || !password) {
      return c.json({ error: 'Username and password required' }, 400)
    }

    const db = c.env.DB
    const user = await db.prepare(
      'SELECT id, username, password_hash FROM users WHERE username = ?'
    ).bind(username).first()

    if (!user) {
      return c.json({ error: 'Invalid username or password' }, 401)
    }

    const hashedInput = await hashPassword(password)
    if (user.password_hash !== hashedInput) {
      return c.json({ error: 'Invalid username or password' }, 401)
    }

    // Generate JWT
    const payload = {
      id: user.id,
      username: user.username,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours
    }
    const token = await sign(payload, JWT_SECRET)

    return c.json({ 
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username }
    })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// --- PROTECTED ROUTES ---

// Get current user details
app.get('/api/protected/user/me', async (c) => {
  const payload = c.get('user')
  return c.json({ user: payload })
})

// Log a workout session
app.post('/api/protected/workout/log', async (c) => {
  try {
    const payload = c.get('user')
    const body = await c.req.json()
    const { name, type, sets, reps, weight } = body
    
    const db = c.env.DB
    const result = await db.prepare(
      'INSERT INTO workouts (user_id, name, type, sets, reps, weight) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(payload.id, name, type, sets, reps, weight).run()

    if (result.success) {
      return c.json({ message: 'Workout logged successfully' }, 201)
    }
    return c.json({ error: 'Failed to log workout' }, 500)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Fetch workout history
app.get('/api/protected/workout/history', async (c) => {
  try {
    const payload = c.get('user')
    const db = c.env.DB
    const results = await db.prepare(
      'SELECT id, name, type, sets, reps, weight, created_at FROM workouts WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
    ).bind(payload.id).all()

    return c.json({ history: results.results })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

export default app
