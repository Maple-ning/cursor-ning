const express = require('express')
const controller = require('../controllers/projectsController')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

router.get('/', controller.getProjects)
router.post('/', requireAuth, controller.createProject)
router.put('/:id', requireAuth, controller.updateProject)
router.delete('/:id', requireAuth, controller.deleteProject)

module.exports = router
