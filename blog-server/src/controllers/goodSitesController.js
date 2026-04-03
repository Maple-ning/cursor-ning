const pool = require('../config/db')

const asRowArray = (rows) => (Array.isArray(rows) ? rows : [])

/** 纯 JSON 对象，避免 RowDataPacket / 非预期结构导致客户端解析异常 */
const toPlainGoodSiteRow = (r) => ({
  id: Number(r.id),
  title: r.title == null ? '' : String(r.title),
  url: r.url == null ? '' : String(r.url),
  description: r.description == null ? '' : String(r.description),
  category: r.category == null ? '' : String(r.category),
  sort_order: Number(r.sort_order) || 0,
  created_at: r.created_at == null ? null : String(r.created_at),
  updated_at: r.updated_at == null ? null : String(r.updated_at),
})

/** 合并库中顺序与站点实际分类：未登记的新分类排在后面（中文排序） */
const mergeCategoryOrder = (siteCategories, dbOrder) => {
  const set = new Set(siteCategories)
  const out = []
  for (const c of dbOrder) {
    if (set.has(c)) out.push(c)
  }
  const missing = [...set].filter((c) => !out.includes(c))
  missing.sort((a, b) => a.localeCompare(b, 'zh-CN'))
  return [...out, ...missing]
}

const ensureCategoryOrderRow = async (category) => {
  const cat = String(category || '').trim()
  if (!cat) return
  const [[row]] = await pool.query('SELECT COALESCE(MAX(sort_order), -1) AS m FROM good_site_category_order')
  const next = Number(row?.m ?? -1) + 1
  await pool.query('INSERT IGNORE INTO good_site_category_order (category, sort_order) VALUES (?, ?)', [cat, next])
}

const getGoodSites = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM good_sites ORDER BY sort_order ASC, id DESC',
    )
    const [orderRows] = await pool.query(
      'SELECT category FROM good_site_category_order ORDER BY sort_order ASC, category ASC',
    )
    const rowList = asRowArray(rows)
    const orderList = asRowArray(orderRows)
    const dbOrder = orderList.map((r) => String(r.category ?? '')).filter(Boolean)
    const siteCats = rowList.map((r) => r.category)
    const categoryOrder = mergeCategoryOrder(siteCats, dbOrder)
    const items = rowList.map(toPlainGoodSiteRow)
    res.json({ items, categoryOrder })
  } catch (error) {
    res.status(500).json({ message: '获取好站失败', error: error.message })
  }
}

const updateCategoryOrder = async (req, res) => {
  const { order } = req.body
  if (!Array.isArray(order)) {
    return res.status(400).json({ message: 'order 须为分类名称数组' })
  }
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    let i = 0
    for (const raw of order) {
      const cat = String(raw || '').trim()
      if (!cat) continue
      await conn.query(
        'INSERT INTO good_site_category_order (category, sort_order) VALUES (?, ?) ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order)',
        [cat, i],
      )
      i += 1
    }
    await conn.commit()
    res.json({ message: '分类顺序已保存' })
  } catch (error) {
    await conn.rollback()
    res.status(500).json({ message: '保存分类顺序失败', error: error.message })
  } finally {
    conn.release()
  }
}

const createGoodSite = async (req, res) => {
  const { title, url, description = '', category, sortOrder = 0 } = req.body
  if (!title || !url || !category) {
    return res.status(400).json({ message: '标题、链接和分类为必填' })
  }
  try {
    await ensureCategoryOrderRow(category)
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
    await ensureCategoryOrderRow(category)
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
  updateCategoryOrder,
  createGoodSite,
  updateGoodSite,
  deleteGoodSite,
}
