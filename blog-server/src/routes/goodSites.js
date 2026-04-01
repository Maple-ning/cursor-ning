const express = require('express')
const controller = require('../controllers/goodSitesController')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

router.get('/', controller.getGoodSites)
router.post('/', requireAuth, controller.createGoodSite)
router.put('/:id', requireAuth, controller.updateGoodSite)
router.delete('/:id', requireAuth, controller.deleteGoodSite)

module.exports = router
