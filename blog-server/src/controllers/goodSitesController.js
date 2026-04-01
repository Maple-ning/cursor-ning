const pool = require('../config/db')

const getGoodSites = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM good_sites ORDER BY sort_order ASC, id DESC',
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: '获取好站失败', error: error.message })
  }
}

const createGoodSite = async (req, res) => {
  const { title, url, description = '', category, sortOrder = 0 } = req.body
  if (!title || !url || !category) {
    return res.status(400).json({ message: '标题、链接和分类为必填' })
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO good_sites (title, url, description, category, sort_order) VALUES (?, ?, ?, ?, ?)',
      [title, url, description, category, Number(sortOrder) || 0],
    )
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    res.status(500).json({ message: '创建好站失败', error: error.message })
  }
}

const updateGoodSite = async (req, res) => {
  const { id } = req.params
  const { title, url, description = '', category, sortOrder = 0 } = req.body
  if (!title || !url || !category) {
    return res.status(400).json({ message: '标题、链接和分类为必填' })
  }
  try {
    const [result] = await pool.query(
      'UPDATE good_sites SET title = ?, url = ?, description = ?, category = ?, sort_order = ? WHERE id = ?',
      [title, url, description, category, Number(sortOrder) || 0, id],
    )
    if (result.affectedRows === 0) return res.status(404).json({ message: '记录不存在' })
    res.json({ message: '更新成功' })
  } catch (error) {
    res.status(500).json({ message: '更新好站失败', error: error.message })
  }
}

const deleteGoodSite = async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await pool.query('DELETE FROM good_sites WHERE id = ?', [id])
    if (result.affectedRows === 0) return res.status(404).json({ message: '记录不存在' })
    res.json({ message: '删除成功' })
  } catch (error) {
    res.status(500).json({ message: '删除好站失败', error: error.message })
  }
}

module.exports = {
  getGoodSites,
  createGoodSite,
  updateGoodSite,
  deleteGoodSite,
}
