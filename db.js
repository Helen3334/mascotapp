const mysql = require('mysql2/promise');
require('dotenv').config();

const DATABASE_HOST = process.env.DB_HOST;
const DATABASE_PORT = process.env.DB_PORT;
const DATABASE_NAME = process.env.DB_NAME;
const DATABASE_USER = process.env.DB_USER;
const DATABASE_PASSWORD = process.env.DB_PASSWORD;

const db = mysql.createPool({
  host: DATABASE_HOST,
  port: DATABASE_PORT,
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000
});

(async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ Conexión a MySQL con mysql2/promise establecida correctamente.');
    connection.release();
  } catch (err) {
    console.error('❌ Error al conectar a MySQL:', err);
  }
})();

module.exports = db;
