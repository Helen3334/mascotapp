// auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

// ✅ REGISTRO
router.post('/register', async (req, res) => {
  const { nombre, correo, contraseña } = req.body;

  if (!nombre || !correo || !contraseña) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // ✅ Verificación de correo con Abstract API (controlada con Timeout)
    const abstractApiKey = process.env.ABSTRACT_API_KEY;
    if (abstractApiKey) {
      const response = await axios.get(
        `https://emailvalidation.abstractapi.com/v1/?api_key=${abstractApiKey}&email=${correo}`,
        { timeout: 5000 } // Tiempo límite de 5 segundos
      );
      const emailData = response.data;

      console.log('Verificación de Abstract API:', emailData);

      if (!emailData.is_valid_format.value || emailData.deliverability !== 'DELIVERABLE') {
        return res.status(400).json({ error: 'El correo ingresado no es válido o no existe.' });
      }
    }

    // ✅ Verificación de correo ya registrado
    const [results] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    if (results.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // ✅ Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // ✅ Insertar nuevo usuario
    await db.query(
      'INSERT INTO usuarios (nombre, correo, contraseña) VALUES (?, ?, ?)',
      [nombre, correo, hashedPassword]
    );

    res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ error: 'Error del servidor (register)' });
  }
});

// ✅ LOGIN
router.post('/login', async (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
  }

  try {
    const [results] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);

    if (results.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const usuario = results[0];
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
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Error del servidor (login)' });
  }
});

module.exports = router;
