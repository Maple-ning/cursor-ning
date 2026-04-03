/**
 * 生成好站模拟数据（本地联调/大列表体验测试）
 *
 * 用法：
 * - node scripts/seed-good-sites-mock.js --clear
 * - node scripts/seed-good-sites-mock.js --clear --category-count=12 --per-category=30
 * - node scripts/seed-good-sites-mock.js --dry-run
 */
const path = require('path')
const mysql = require('mysql2/promise')

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const DEFAULT_CATEGORIES = [
  '前端工程',
  '后端开发',
  '数据库',
  'AI 工具',
  '设计灵感',
  '产品思维',
  '性能优化',
  '开源社区',
  '学习资源',
  '效率工具',
  '运维部署',
  '安全测试',
]

const DOMAIN_POOL = ['docs.example.com', 'devhub.example.org', 'learn.example.dev', 'labs.example.io', 'guide.example.net']

const parseArgs = () => {
  const args = process.argv.slice(2)
  const getNum = (key, fallback) => {
    const matched = args.find((a) => a.startsWith(`${key}=`))
    if (!matched) return fallback
    const n = Number(matched.split('=').slice(1).join('='))
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
  }
  return {
    clear: args.includes('--clear'),
    dryRun: args.includes('--dry-run'),
    perCategory: getNum('--per-category', 24),
    categoryCount: getNum('--category-count', 10),
  }
}

const slugify = (text) =>
  String(text)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const buildRows = (categories, perCategory) => {
  const rows = []
  for (let c = 0; c < categories.length; c += 1) {
    const category = categories[c]
    const cSlug = slugify(category)
    for (let i = 0; i < perCategory; i += 1) {
      const idx = i + 1
      const domain = DOMAIN_POOL[(c + i) % DOMAIN_POOL.length]
      const tag = `${cSlug}-${String(idx).padStart(2, '0')}`
      rows.push({
        title: `${category}精选 #${idx}`,
        url: `https://${domain}/${cSlug}/${tag}`,
        description: `面向 ${category} 的第 ${idx} 条参考站点，适合用于列表浏览与检索压测。`,
        category,
        sort_order: i,
      })
    }
  }
  return rows
}

const ensureTables = async (conn) => {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS good_sites (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      url VARCHAR(500) NOT NULL,
      description VARCHAR(500) NOT NULL DEFAULT '',
      category VARCHAR(100) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_good_sites_category (category)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `)

  await conn.query(`
    CREATE TABLE IF NOT EXISTS good_site_category_order (
      category VARCHAR(100) NOT NULL PRIMARY KEY,
      sort_order INT NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `)
}

async function main() {
  const { clear, dryRun, perCategory, categoryCount } = parseArgs()
  const categories = DEFAULT_CATEGORIES.slice(0, categoryCount)
  const rows = buildRows(categories, perCategory)

  if (dryRun) {
    console.log('[dry-run] categories:', categories.length)
    console.log('[dry-run] rows:', rows.length)
    console.log('[dry-run] sample:', rows[0])
    return
  }

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    multipleStatements: true,
  })

  try {
    await ensureTables(conn)
    await conn.beginTransaction()

    if (clear) {
      await conn.query('DELETE FROM good_sites')
      await conn.query('DELETE FROM good_site_category_order')
    }

    for (let i = 0; i < categories.length; i += 1) {
      await conn.query(
        `INSERT INTO good_site_category_order (category, sort_order)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order)`,
        [categories[i], i]
      )
    }

    const placeholders = rows.map(() => '(?, ?, ?, ?, ?)').join(', ')
    const params = []
    for (const row of rows) {
      params.push(row.title, row.url, row.description, row.category, row.sort_order)
    }

    await conn.query(
      `INSERT INTO good_sites (title, url, description, category, sort_order)
       VALUES ${placeholders}`,
      params
    )

    await conn.commit()
    console.log(`seed-good-sites-mock: ok (categories=${categories.length}, rows=${rows.length}, clear=${clear})`)
  } catch (error) {
    await conn.rollback()
    throw error
  } finally {
    await conn.end()
  }
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
