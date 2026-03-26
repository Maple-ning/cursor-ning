const express = require('express')
const controller = require('../controllers/profileController')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

router.get('/', controller.getProfile)
router.put('/', requireAuth, controller.upsertProfile)

module.exports = router
