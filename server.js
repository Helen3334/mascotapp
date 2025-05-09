const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();
const path = require('path');
const verificarToken = require('./routes/authMiddleware');

const app = express();

app.use(cors({
  origin: 'https://mascotapp-b04v.onrender.com',
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);


app.use('/api', verificarToken, require('./routes/reportes'));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


app.get('/inicio.html', verificarToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'inicio.html'));
});

app.get('/reportar-perdida.html', verificarToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reportar-perdida.html'));
});

app.get('/reportar-encontrada.html', verificarToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reportar-encontrada.html'));
});

app.get('/ver-reportes.html', verificarToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ver-reportes.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});


app.use('/api', require('./routes/reportes'));
const PORT = process.env.PORT || 3001;
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
