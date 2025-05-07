// db-test.js
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'sql.freedb.tech',
  user: process.env.DB_USER || 'freedb_mypetsadm',
  password: process.env.DB_PASSWORD || 'cseU7y?yzZTf!XQ',
  database: process.env.DB_NAME || 'freedb_app_mascotas'
});

// Probar la conexión
connection.connect((err) => {
  if (err) {
    console.error('❌ Error de conexión:', err);
    process.exit(1);
  }

  console.log('✅ Conexión exitosa a la base de datos');
  process.exit(0);
});
