import { verify } from 'hono/jwt'

export const JWT_SECRET = 'seize-super-secret-key-change-in-prod'

export const authMiddleware = async (c, next) => {
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
}
