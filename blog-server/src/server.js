require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { optionalAuth } = require('./middleware/auth')
const authRoutes = require('./routes/auth')
const postsRoutes = require('./routes/posts')
const projectsRoutes = require('./routes/projects')
const profileRoutes = require('./routes/profile')

const app = express()
const port = Number(process.env.PORT || 3001)

app.use(cors())
app.use(express.json())
app.use(optionalAuth)

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRoutes)
app.use('/api/posts', postsRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/profile', profileRoutes)

app.listen(port, () => {
  console.log(`blog-server listening on http://localhost:${port}`)
})
