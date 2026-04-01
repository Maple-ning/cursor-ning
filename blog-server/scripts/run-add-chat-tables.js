/**
 * 在服务器项目 app 目录执行：
 * node scripts/run-add-chat-tables.js [sql路径]
 * 默认执行 sql/add-chat-tables.sql
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const sqlPath = process.argv[2] || path.join(__dirname, '..', 'sql', 'add-chat-tables.sql');

async function main() {
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });
  await conn.query(sql);
  await conn.end();
  console.log('add-chat-tables: ok');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
