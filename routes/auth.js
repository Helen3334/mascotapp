const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

// REGISTRO
router.post('/register', async (req, res) => {
  const { nombre, correo, contraseña } = req.body;

  if (!nombre || !correo || !contraseña) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  
  try {
    const abstractApiKey = process.env.ABSTRACT_API_KEY;
    const response = await axios.get(`https://emailvalidation.abstractapi.com/v1/?api_key=${abstractApiKey}&email=${correo}`);
    const emailData = response.data;

    console.log('Verificación de Abstract API:', emailData);

    if (!emailData.is_valid_format.value || emailData.deliverability !== 'DELIVERABLE') {
      return res.status(400).json({ error: 'El correo ingresado no es válido o no existe.' });
    }
  } catch (error) {
    console.error('Error en la verificación del correo con Abstract:', error);
    return res.status(500).json({ error: 'Error al verificar el correo. Inténtalo más tarde.' });
  }

  // Verificación de contraseña segura
  const contraseñaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/;
  if (!contraseñaRegex.test(contraseña)) {
    return res.status(400).json({ 
      error: 'La contraseña debe tener al menos 6 caracteres, una letra mayúscula, una letra minúscula, un número y un símbolo especial.' 
    });
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

// LOGIN
// LOGIN
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

// REGISTRO
router.post('/register', async (req, res) => {
  const { nombre, correo, contraseña } = req.body;

  if (!nombre || !correo || !contraseña) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const [results] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);

    if (results.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(contraseña, 10);

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
module.exports = router;