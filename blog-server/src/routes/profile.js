const express = require('express')
const controller = require('../controllers/profileController')
const goodSitesRoutes = require('./goodSites')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

// 写在 `/` 之前，避免与「关于我」根路径冲突
router.use('/good-sites', goodSitesRoutes)
router.get('/', controller.getProfile)
router.put('/', requireAuth, controller.upsertProfile)

module.exports = router
