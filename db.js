const mysql = require('mysql2');
require('dotenv').config();

const Sequelize = require('sequelize');

const DATABASE_HOST = process.env.DB_HOST;
const DATABASE_PORT = process.env.DB_PORT;
const DATABASE_NAME = process.env.DB_NAME;
const DATABASE_USER = process.env.DB_USER;
const DATABASE_PASSWORD = process.env.DB_PASSWORD;

const db = mysql.createPool({
  host: DATABASE_HOST,
  PORT: DATABASE_PORT,
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000
});

// Opcional: Probar la conexión (usando el pool)
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error al conectar a MySQL con mysql2:', err);
    return;
  }
  console.log('Conexión a MySQL con mysql2 establecida correctamente.');
  connection.release(); // Liberar la conexión al pool
});


module.exports = db;
