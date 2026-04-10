import { Hono } from 'hono'
import { authMiddleware } from '../middleware/authMiddleware'

const workouts = new Hono()

// Apply protection to all workout routes
workouts.use('*', authMiddleware)

// Get current user details
workouts.get('/me', async (c) => {
  const payload = c.get('user')
  return c.json({ user: payload })
})

// Log a workout session
workouts.post('/log', async (c) => {
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
workouts.get('/history', async (c) => {
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

export default workouts
