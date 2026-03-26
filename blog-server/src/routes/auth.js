const express = require('express')
const { signAdminRefreshToken, signAdminToken, verifyRefreshToken } = require('../middleware/auth')

const router = express.Router()
const failedAttempts = new Map()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 10 * 60 * 1000
const LOCK_MS = 15 * 60 * 1000

const getAttemptKey = (req, username) => `${req.ip || 'unknown'}:${username || 'unknown'}`

const cleanupExpiredAttempts = (now) => {
  for (const [key, state] of failedAttempts.entries()) {
    if (state.lockedUntil && state.lockedUntil > now) continue
    if (now - state.firstAttemptAt > WINDOW_MS) failedAttempts.delete(key)
  }
}

router.post('/login', (req, res) => {
  const { username, password } = req.body || {}
  const now = Date.now()
  cleanupExpiredAttempts(now)
  const key = getAttemptKey(req, username)
  const state = failedAttempts.get(key)

  if (state?.lockedUntil && state.lockedUntil > now) {
    const retryAfterSec = Math.ceil((state.lockedUntil - now) / 1000)
    return res.status(429).json({ message: `登录失败次数过多，请 ${retryAfterSec}s 后重试` })
  }

  if (username !== 'admin' || password !== 'admin123') {
    const nextState = state
      ? { ...state, count: state.count + 1 }
      : { count: 1, firstAttemptAt: now, lockedUntil: 0 }
    if (nextState.count >= MAX_ATTEMPTS && now - nextState.firstAttemptAt <= WINDOW_MS) {
      nextState.lockedUntil = now + LOCK_MS
    }
    failedAttempts.set(key, nextState)
    return res.status(401).json({ message: '账号或密码错误' })
  }

  failedAttempts.delete(key)
  const token = signAdminToken()
  const refreshToken = signAdminRefreshToken()
  return res.json({ token, refreshToken, user: { username: 'admin' } })
})

router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body || {}
  if (!refreshToken) return res.status(400).json({ message: 'refreshToken 不能为空' })
  try {
    const payload = verifyRefreshToken(refreshToken)
    if (!payload || payload.role !== 'admin') {
      return res.status(401).json({ message: 'refreshToken 无效' })
    }
    return res.json({ token: signAdminToken() })
  } catch {
    return res.status(401).json({ message: 'refreshToken 已过期或无效' })
  }
})

module.exports = router
