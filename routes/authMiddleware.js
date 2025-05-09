
const jwt = require('jsonwebtoken');
require('dotenv').config();

function verificarToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1] || req.cookies?.token;

  if (!token) {
    return res.status(403).json({ error: 'Acceso denegado. Debes iniciar sesión.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token no válido. Debes iniciar sesión nuevamente.' });
  }
}

module.exports = verificarToken;
