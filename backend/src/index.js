import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRoutes from './routes/authRoutes'
import workoutRoutes from './routes/workoutRoutes'

const app = new Hono()

// Apply CORS to all routes
app.use('*', cors({
  origin: '*', // Restrict this to the vercel frontend URL in production
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Health check
app.get('/', (c) => c.json({ status: 'ok', app: 'Seize Worker API' }))

// Register Routes
app.route('/api/auth', authRoutes)
app.route('/api/protected/workout', workoutRoutes)

export default app
