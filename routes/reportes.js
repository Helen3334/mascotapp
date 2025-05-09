const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const fs = require('fs');
const verificarToken = require('./authMiddleware');

// Configuración de almacenamiento
const uploadFolder = 'uploads';
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder); // Carpeta para guardar imágenes
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Reportar mascota (con imagen)
router.post('/reportes', verificarToken, upload.single('petimagen'), async (req, res) => {
  const { usuario_id, nombre, tipo, raza_id, color, latitud, longitud, descripcion, contacto, tipo_reporte } = req.body;
  const imagen = req.file ? req.file.filename : null;

  try {
    const sql = `
      INSERT INTO reportes_mascotas 
      (usuario_id, nombre, tipo, raza_id, color, latitud, longitud, descripcion, contacto, tipo_reporte, imagen) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.query(sql, [
      usuario_id, nombre || null, tipo, raza_id, color, 
      latitud, longitud, descripcion, contacto, tipo_reporte, imagen
    ]);

    res.status(201).json({ message: 'Reporte con imagen guardado correctamente' });
  } catch (err) {
    console.error('Error al guardar reporte:', err);
    res.status(500).json({ error: 'Error al guardar el reporte' });
  }
});

// Obtener todos los reportes
// Obtener todos los reportes
router.get('/reportes', verificarToken, async (req, res) => {
  const { tipo } = req.query;

  try {
    const sql = `
      SELECT 
        r.*, 
        ra.nombre_raza AS raza 
      FROM reportes_mascotas r 
      LEFT JOIN razas ra ON r.raza_id = ra.id 
      ${tipo ? 'WHERE r.tipo_reporte = ?' : ''}
    `;
    const [results] = await db.query(sql, tipo ? [tipo] : []);
    res.json(results);
  } catch (err) {
    console.error('Error al obtener reportes:', err);
    res.status(500).json({ error: 'Error al obtener reportes' });
  }
})

module.exports = router;
