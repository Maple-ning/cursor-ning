/**
 * 在服务器上执行：node scripts/run-add-good-sites.js [sql文件路径]
 * 默认读取项目根目录下 sql/add-good-sites.sql，使用当前目录 .env 中的数据库配置。
 */
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const sqlPath = process.argv[2] || path.join(__dirname, '..', 'sql', 'add-good-sites.sql');

async function main() {
  const mysql = require('mysql2/promise');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });
  await conn.query(sql);
  await conn.end();
  console.log('add-good-sites: ok');
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
