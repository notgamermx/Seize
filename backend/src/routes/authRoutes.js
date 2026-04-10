import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { hashPassword } from '../utils/cryptoUtils'
import { JWT_SECRET } from '../middleware/authMiddleware'

const auth = new Hono()

// Register Route
auth.post('/register', async (c) => {
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
    if (error.message.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'Username already taken' }, 409)
    }
    return c.json({ error: error.message }, 500)
  }
})

// Login Route
auth.post('/login', async (c) => {
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

export default auth
