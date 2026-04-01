require('dotenv').config()
const http = require('http')
const path = require('path')
const express = require('express')
const cors = require('cors')
const { optionalAuth } = require('./middleware/auth')
const authRoutes = require('./routes/auth')
const postsRoutes = require('./routes/posts')
const projectsRoutes = require('./routes/projects')
const profileRoutes = require('./routes/profile')
const goodSitesRoutes = require('./routes/goodSites')
const chatRoutes = require('./routes/chat')
const { attachChatSocket } = require('./socket/chatSocket')

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
app.use('/api/goodsites', goodSitesRoutes)
app.use('/api/good-sites', goodSitesRoutes)
app.use('/api/chat', chatRoutes)
const chatUploadDir = process.env.CHAT_UPLOAD_DIR || path.join(__dirname, '../shared/chat-uploads')
app.use('/api/chat/uploads', express.static(chatUploadDir))

const server = http.createServer(app)
attachChatSocket(server)

server.listen(port, () => {
  console.log(`blog-server listening on http://localhost:${port}`)
  console.log(
    '[chat] Socket.io at /api/chat-socket/ — Nginx example: location /api/chat-socket/ { proxy_pass http://127.0.0.1:' +
      port +
      '; proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; }',
  )
})
