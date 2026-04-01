const mysql = require('mysql2/promise')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_NAME']
const missingEnv = requiredEnv.filter((key) => !process.env[key] || String(process.env[key]).trim() === '')
if (missingEnv.length > 0) {
  throw new Error(`Missing required DB config: ${missingEnv.join(', ')}`)
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  // Keep DATE/DATETIME as strings to avoid timezone shift (e.g. 2026-03-31 -> 2026-03-30)
  dateStrings: true,
  waitForConnections: true,
  connectionLimit: 10,
})

module.exports = pool
