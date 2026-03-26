const pool = require('../config/db')

const getPosts = async (req, res) => {
  const { category, status } = req.query
  try {
    const params = []
    let sql = 'SELECT * FROM posts'
    const conditions = []
    if (category) {
      conditions.push('category = ?')
      params.push(category)
    }
    if (req.user) {
      if (status) {
        conditions.push('status = ?')
        params.push(status)
      }
    } else {
      conditions.push('status = ?')
      params.push('published')
    }
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`
    }
    sql += ' ORDER BY date DESC, id DESC'
    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: '获取文章失败', error: error.message })
  }
}

const createPost = async (req, res) => {
  const { title, summary, content, tags = [], date, category, status = 'draft' } = req.body
  if (!title || !summary || !date || !category) {
    return res.status(400).json({ message: '缺少必要字段' })
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO posts (title, summary, content, tags, date, category, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, summary, content || '', JSON.stringify(tags), date, category, status],
    )
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    res.status(500).json({ message: '创建文章失败', error: error.message })
  }
}

const updatePost = async (req, res) => {
  const { id } = req.params
  const { title, summary, content, tags = [], date, category, status = 'draft' } = req.body
  try {
    const [result] = await pool.query(
      'UPDATE posts SET title = ?, summary = ?, content = ?, tags = ?, date = ?, category = ?, status = ? WHERE id = ?',
      [title, summary, content || '', JSON.stringify(tags), date, category, status, id],
    )
    if (result.affectedRows === 0) return res.status(404).json({ message: '文章不存在' })
    res.json({ message: '更新成功' })
  } catch (error) {
    res.status(500).json({ message: '更新文章失败', error: error.message })
  }
}

const deletePost = async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await pool.query('DELETE FROM posts WHERE id = ?', [id])
    if (result.affectedRows === 0) return res.status(404).json({ message: '文章不存在' })
    res.json({ message: '删除成功' })
  } catch (error) {
    res.status(500).json({ message: '删除文章失败', error: error.message })
  }
}

module.exports = {
  getPosts,
  createPost,
  updatePost,
  deletePost,
}
