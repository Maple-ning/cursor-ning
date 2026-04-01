const { Server } = require('socket.io')

const chatController = require('../controllers/chatController')

/**
 * Socket.io path: /api/chat-socket/
 * Nginx 需单独反代 WebSocket，示例见 server 启动日志注释。
 */
function attachChatSocket(httpServer) {
  const io = new Server(httpServer, {
    path: '/api/chat-socket/',
    cors: { origin: true },
  })

  io.on('connection', (socket) => {
    socket.on('join', async (payload, ack) => {
      const roomId = Number(payload?.roomId)
      const shareCode = payload?.shareCode
      const nickname = payload?.nickname
      try {
        const ok = await chatController.verifyRoomAccess(roomId, shareCode)
        if (!ok) {
          ack?.({ ok: false, message: '分享码不正确' })
          return
        }
        await socket.join(`room:${roomId}`)
        socket.data.roomId = roomId
        socket.data.shareCode = chatController.normalizeShareCode(shareCode)
        socket.data.nickname = String(nickname || '匿名').trim().slice(0, 32) || '匿名'
        ack?.({ ok: true })
      } catch (e) {
        ack?.({ ok: false, message: e.message || '加入失败' })
      }
    })

    socket.on('message', async (payload, ack) => {
      const roomId = Number(payload?.roomId)
      const shareCode = payload?.shareCode
      const text = payload?.text
      const imageUrl = payload?.imageUrl
      const nickname = payload?.nickname ?? socket.data.nickname
      try {
        if (socket.data.roomId !== roomId) {
          ack?.({ ok: false, message: '请先加入房间' })
          return
        }
        if (chatController.normalizeShareCode(shareCode) !== socket.data.shareCode) {
          ack?.({ ok: false, message: '分享码不匹配' })
          return
        }
        const row = await chatController.insertMessage(roomId, nickname, text, imageUrl)
        io.to(`room:${roomId}`).emit('message', row)
        ack?.({ ok: true, id: row.id })
      } catch (e) {
        if (e.code === 'EMPTY_MESSAGE') {
          ack?.({ ok: false, message: '消息不能为空' })
          return
        }
        ack?.({ ok: false, message: e.message || '发送失败' })
      }
    })
  })

  return io
}

module.exports = { attachChatSocket }
