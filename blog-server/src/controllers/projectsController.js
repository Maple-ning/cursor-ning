const pool = require('../config/db')

const normalizeHttpUrl = (value) => {
  const v = String(value || '').trim()
  if (!v) return ''
  return /^https?:\/\//i.test(v) ? v : `https://${v}`
}

const isHttpUrl = (value) => {
  if (!value) return false
  try {
    const parsed = new URL(String(value))
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const getProjects = async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM projects ORDER BY id DESC')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: '获取项目失败', error: error.message })
  }
}

const createProject = async (req, res) => {
  const { name, description, url, sourceCodeUrl = '', techStack = [] } = req.body
  const normalizedUrl = normalizeHttpUrl(url)
  const normalizedSourceCodeUrl = normalizeHttpUrl(sourceCodeUrl)
  if (!name || !description || !url) {
    return res.status(400).json({ message: '缺少必要字段' })
  }
  if (!isHttpUrl(normalizedUrl)) {
    return res.status(400).json({ message: '项目地址需为 http/https 链接' })
  }
  if (normalizedSourceCodeUrl && !isHttpUrl(normalizedSourceCodeUrl)) {
    return res.status(400).json({ message: '源码地址需为 http/https 链接' })
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO projects (name, description, url, source_code_url, tech_stack) VALUES (?, ?, ?, ?, ?)',
      [name, description, normalizedUrl, normalizedSourceCodeUrl, JSON.stringify(techStack)],
    )
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    res.status(500).json({ message: '创建项目失败', error: error.message })
  }
}

const updateProject = async (req, res) => {
  const { id } = req.params
  const { name, description, url, sourceCodeUrl = '', techStack = [] } = req.body
  const normalizedUrl = normalizeHttpUrl(url)
  const normalizedSourceCodeUrl = normalizeHttpUrl(sourceCodeUrl)
  if (!name || !description || !url) {
    return res.status(400).json({ message: '缺少必要字段' })
  }
  if (!isHttpUrl(normalizedUrl)) {
    return res.status(400).json({ message: '项目地址需为 http/https 链接' })
  }
  if (normalizedSourceCodeUrl && !isHttpUrl(normalizedSourceCodeUrl)) {
    return res.status(400).json({ message: '源码地址需为 http/https 链接' })
  }
  try {
    const [result] = await pool.query(
      'UPDATE projects SET name = ?, description = ?, url = ?, source_code_url = ?, tech_stack = ? WHERE id = ?',
      [name, description, normalizedUrl, normalizedSourceCodeUrl, JSON.stringify(techStack), id],
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
