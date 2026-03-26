const express = require('express')
const controller = require('../controllers/postsController')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

router.get('/', controller.getPosts)
router.post('/', requireAuth, controller.createPost)
router.put('/:id', requireAuth, controller.updatePost)
router.delete('/:id', requireAuth, controller.deletePost)

module.exports = router
