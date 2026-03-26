const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}-refresh`

const optionalAuth = (req, _res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return next()
  try {
    req.user = jwt.verify(token, JWT_SECRET)
  } catch {
    req.user = null
  }
  next()
}

const requireAuth = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: '未登录或登录已失效' })
  next()
}

const signAdminToken = () =>
  jwt.sign({ role: 'admin', username: 'admin' }, JWT_SECRET, { expiresIn: '2h' })

const signAdminRefreshToken = () =>
  jwt.sign({ role: 'admin', username: 'admin', type: 'refresh' }, REFRESH_SECRET, { expiresIn: '7d' })

const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET)

module.exports = {
  optionalAuth,
  requireAuth,
  signAdminToken,
  signAdminRefreshToken,
  verifyRefreshToken,
}
