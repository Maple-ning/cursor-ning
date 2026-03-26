const pool = require('../config/db')

const getProfile = async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM profile LIMIT 1')
    if (rows.length === 0) return res.json(null)
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ message: '获取关于我失败', error: error.message })
  }
}

const upsertProfile = async (req, res) => {
  const { name, intro, email, github } = req.body
  if (!name || !intro) return res.status(400).json({ message: '缺少必要字段' })
  try {
    const [rows] = await pool.query('SELECT id FROM profile LIMIT 1')
    if (rows.length === 0) {
      await pool.query(
        'INSERT INTO profile (name, intro, email, github) VALUES (?, ?, ?, ?)',
        [name, intro, email || '', github || ''],
      )
    } else {
      await pool.query(
        'UPDATE profile SET name = ?, intro = ?, email = ?, github = ? WHERE id = ?',
        [name, intro, email || '', github || '', rows[0].id],
      )
    }
    res.json({ message: '保存成功' })
  } catch (error) {
    res.status(500).json({ message: '保存关于我失败', error: error.message })
  }
}

module.exports = {
  getProfile,
  upsertProfile,
}
