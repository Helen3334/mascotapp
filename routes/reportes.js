const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const fs = require('fs');

// Configuración de almacenamiento
const uploadFolder = 'uploads';
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder); // Carpeta donde guardar imágenes
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

router.post('/reportes', upload.single('petimagen'), (req, res) => {
  const {
    usuario_id,
    nombre,
    tipo,
    raza_id,
    color,
    latitud,
    longitud,
    descripcion,
    contacto,
    tipo_reporte,

  } = req.body;

  const imagen = req.file ? req.file.filename : null;

  const sql = `
    INSERT INTO reportes_mascotas 
    (usuario_id, nombre, tipo, raza_id, color, latitud, longitud, descripcion, contacto, tipo_reporte, imagen) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    usuario_id,
    nombre || null,
    tipo,
    raza_id,
    color,
    latitud,
    longitud,
    descripcion,
    contacto,
    tipo_reporte,
    imagen
  ], (err, result) => {
    if (err) {
      console.error('Error al guardar reporte:', err);
      return res.status(500).json({ error: 'Error al guardar el reporte' });
    }

    res.status(201).json({ message: 'Reporte con imagen guardado correctamente' });
  });
});

// 🔹 Obtener todos los reportes
router.get('/reportes', (req, res) => {
  const { tipo } = req.query;
  const sql = tipo
    ? 'SELECT * FROM reportes_mascotas WHERE tipo_reporte = ?'
    : 'SELECT * FROM reportes_mascotas';
  const params = tipo ? [tipo] : [];

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error al obtener reportes:', err);
      return res.status(500).json({ error: 'Error al obtener reportes' });
    }

    res.json(results);
  });
});

// 🔹 Obtener razas
router.get('/razas', (req, res) => {
  db.query('SELECT * FROM razas ORDER BY tipo, nombre_raza ', (err, results) => {
    if (err) {
      console.error('Error al obtener razas:', err);
      return res.status(500).json({ error: 'Error al obtener razas' });
    }
    res.json(results);
  });
});

module.exports = router;