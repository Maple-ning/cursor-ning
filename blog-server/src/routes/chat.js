const express = require('express')
const fs = require('fs')
const multer = require('multer')
const path = require('path')

const controller = require('../controllers/chatController')

// 与 shared/.env 同级目录，避免随 deploy 清空 app 时丢失已上传图片
const uploadDir = process.env.CHAT_UPLOAD_DIR || path.join(__dirname, '../../shared/chat-uploads')
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase()
    const safe = ext && /^\.(jpe?g|png|gif|webp)$/i.test(ext) ? ext : '.bin'
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safe}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype)
    cb(null, ok)
  },
})

const router = express.Router()

router.post('/rooms', controller.createRoom)
router.post('/join', express.json(), controller.joinRoom)
router.get('/rooms/:roomId/messages', controller.getMessages)
router.post('/rooms/:roomId/upload', upload.single('file'), controller.uploadImage)

module.exports = router
