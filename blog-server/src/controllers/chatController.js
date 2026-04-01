const crypto = require('crypto')

const pool = require('../config/db')

const SHARE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const randomShareCode = () => {
  let code = ''
  for (let i = 0; i < 8; i += 1) {
    code += SHARE_CHARS[crypto.randomInt(0, SHARE_CHARS.length)]
  }
  return code
}

const normalizeShareCode = (code) => String(code || '').replace(/\s+/g, '').toUpperCase()

const createRoom = async (req, res) => {
  const title = String(req.body?.title || '聊天室').trim().slice(0, 128) || '聊天室'
  try {
    let shareCode = ''
    for (let attempt = 0; attempt < 12; attempt += 1) {
      shareCode = randomShareCode()
      try {
        const [result] = await pool.query('INSERT INTO chat_rooms (title, share_code) VALUES (?, ?)', [
          title,
          shareCode,
        ])
        return res.status(201).json({ id: result.insertId, shareCode, title })
      } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') continue
        throw e
      }
    }
    return res.status(500).json({ message: '创建失败，请重试' })
  } catch (error) {
    return res.status(500).json({ message: '创建房间失败', error: error.message })
  }
}

const joinRoom = async (req, res) => {
  const shareCode = normalizeShareCode(req.body?.shareCode)
  if (shareCode.length < 4) {
    return res.status(400).json({ message: '请输入分享码' })
  }
  try {
    const [rows] = await pool.query('SELECT id, title, share_code FROM chat_rooms WHERE share_code = ?', [
      shareCode,
    ])
    if (rows.length === 0) return res.status(404).json({ message: '分享码无效或房间不存在' })
    const row = rows[0]
    return res.json({ roomId: row.id, title: row.title, shareCode: row.share_code })
  } catch (error) {
    return res.status(500).json({ message: '加入失败', error: error.message })
  }
}

const getMessages = async (req, res) => {
  const roomId = Number(req.params.roomId)
  const shareCode = normalizeShareCode(req.query.shareCode)
  if (!roomId || !shareCode) {
    return res.status(400).json({ message: '参数不完整' })
  }
  try {
    const [rooms] = await pool.query('SELECT id FROM chat_rooms WHERE id = ? AND share_code = ?', [
      roomId,
      shareCode,
    ])
    if (rooms.length === 0) return res.status(403).json({ message: '分享码不正确' })
    const afterId = Number(req.query.afterId) || 0
    const limit = Math.min(Number(req.query.limit) || 80, 200)
    const [messages] = await pool.query(
      `SELECT id, room_id AS roomId, sender_name AS senderName, content, image_url AS imageUrl,
              DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
       FROM chat_messages WHERE room_id = ? AND id > ? ORDER BY id ASC LIMIT ?`,
      [roomId, afterId, limit],
    )
    return res.json(messages)
  } catch (error) {
    return res.status(500).json({ message: '获取消息失败', error: error.message })
  }
}

const verifyRoomAccess = async (roomId, shareCode) => {
  const code = normalizeShareCode(shareCode)
  if (!roomId || !code) return false
  const [rows] = await pool.query('SELECT id FROM chat_rooms WHERE id = ? AND share_code = ?', [roomId, code])
  return rows.length > 0
}

const insertMessage = async (roomId, senderName, content, imageUrl) => {
  const name = String(senderName || '匿名').trim().slice(0, 64) || '匿名'
  const text = content != null ? String(content).trim().slice(0, 4000) : ''
  const img = imageUrl ? String(imageUrl).trim().slice(0, 512) : null
  if (!text && !img) {
    const err = new Error('empty')
    err.code = 'EMPTY_MESSAGE'
    throw err
  }
  const [result] = await pool.query(
    'INSERT INTO chat_messages (room_id, sender_name, content, image_url) VALUES (?, ?, ?, ?)',
    [roomId, name, text || null, img],
  )
  const [rows] = await pool.query(
    `SELECT id, room_id AS roomId, sender_name AS senderName, content, image_url AS imageUrl,
            DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
     FROM chat_messages WHERE id = ?`,
    [result.insertId],
  )
  return rows[0]
}

const uploadImage = async (req, res) => {
  const roomId = Number(req.params.roomId)
  const shareCode = normalizeShareCode(req.body?.shareCode)
  if (!roomId || !shareCode) {
    return res.status(400).json({ message: '参数不完整' })
  }
  const ok = await verifyRoomAccess(roomId, shareCode)
  if (!ok) return res.status(403).json({ message: '分享码不正确' })
  if (!req.file) return res.status(400).json({ message: '请选择图片文件' })
  // 相对 API 根路径，前台用 apiBaseUrl（如 /api-blog）拼接成完整 URL
  return res.status(201).json({ url: `/chat/uploads/${req.file.filename}` })
}

module.exports = {
  createRoom,
  joinRoom,
  getMessages,
  verifyRoomAccess,
  insertMessage,
  normalizeShareCode,
  uploadImage,
  randomShareCode,
}
