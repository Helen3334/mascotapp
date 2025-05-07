const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());


const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);


app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

/*const reportesRoutes = require('./routes/reportes');
app.use('/api/reportes', reportesRoutes);*/
app.use('/api', require('./routes/reportes'));
const PORT = process.env.PORT || 3001;
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
