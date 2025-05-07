const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

const router = express.Router();

// REGISTRO
router.post('/register', async (req, res) => {
  const { nombre, correo, contraseña } = req.body;

  if (!nombre || !correo || !contraseña) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Verifica correo ya registrado
  db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], async (err, results) => {
    if (err) {
      console.error('Error al verificar usuario:', err);
      return res.status(500).json({ error: 'Error del servidor (select)' });
    }

    if (results.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    try {
      const hashedPassword = await bcrypt.hash(contraseña, 10);

      db.query(
        'INSERT INTO usuarios (nombre, correo, contraseña) VALUES (?, ?, ?)',
        [nombre, correo, hashedPassword],
        (err, result) => {
          if (err) {
            console.error('Error al insertar usuario:', err);
            return res.status(500).json({ error: 'Error al registrar el usuario (insert)' });
          }

          res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
        }
      );
    } catch (error) {
      console.error('Error al encriptar contraseña:', error);
      res.status(500).json({ error: 'Error interno' });
    }
  });
});

/// LOGIN
router.post('/login', (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
  }

  db.query('SELECT * FROM usuarios WHERE correo = ?', [correo], async (err, results) => {
    if (err) {
      console.error('Error al buscar usuario:', err);
      return res.status(500).json({ error: 'Error del servidor (select)' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const usuario = results[0];

    try {
      const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);

      if (!contraseñaValida) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }

      const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
      });

      res.json({
        mensaje: 'Login exitoso',
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          correo: usuario.correo
        }
      });

    } catch (error) {
      console.error('Error al comparar contraseñas:', error);
      res.status(500).json({ error: 'Error al verificar credenciales' });
    }
  });
});

module.exports = router;

