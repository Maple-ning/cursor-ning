/**
 * 执行 sql/add-profile-extended-fields.sql（可重复执行）
 */
const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

async function main() {
  const sqlPath = path.join(__dirname, '../sql/add-profile-extended-fields.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  })

  try {
    await conn.query(sql)
    console.log('apply-profile-extended-fields: ok')
  } finally {
    await conn.end()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
