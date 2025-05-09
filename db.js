// db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
  host: 'sql.freedb.tech',  // Cambiado directamente a la dirección de dominio
  port: process.env.DB_PORT || 3306, // Asegúrate de que el puerto sea 3306
  user: process.env.DB_USER,        // Usuario de tu base de datos
  password: process.env.DB_PASSWORD, // Contraseña de tu base de datos
  database: process.env.DB_NAME,     // Nombre de la base de datos
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000
});

module.exports = db;
