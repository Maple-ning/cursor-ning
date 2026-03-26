const pool = require('../config/db')

const getProjects = async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM projects ORDER BY id DESC')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: '获取项目失败', error: error.message })
  }
}

const createProject = async (req, res) => {
  const { name, description, url, techStack = [] } = req.body
  if (!name || !description || !url) {
    return res.status(400).json({ message: '缺少必要字段' })
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO projects (name, description, url, tech_stack) VALUES (?, ?, ?, ?)',
      [name, description, url, JSON.stringify(techStack)],
    )
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    res.status(500).json({ message: '创建项目失败', error: error.message })
  }
}

const updateProject = async (req, res) => {
  const { id } = req.params
  const { name, description, url, techStack = [] } = req.body
  try {
    const [result] = await pool.query(
      'UPDATE projects SET name = ?, description = ?, url = ?, tech_stack = ? WHERE id = ?',
      [name, description, url, JSON.stringify(techStack), id],
    )
    if (result.affectedRows === 0) return res.status(404).json({ message: '项目不存在' })
    res.json({ message: '更新成功' })
  } catch (error) {
    res.status(500).json({ message: '更新项目失败', error: error.message })
  }
}

const deleteProject = async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [id])
    if (result.affectedRows === 0) return res.status(404).json({ message: '项目不存在' })
    res.json({ message: '删除成功' })
  } catch (error) {
    res.status(500).json({ message: '删除项目失败', error: error.message })
  }
}

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
}
