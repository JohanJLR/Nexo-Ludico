require('dotenv').config();
const express = require('express');
const app = express();

const connectDB = require('./config/db');
connectDB(); // 🔥 conexión a Mongo

// 🔥 PRIMERO LOS MIDDLEWARES
app.use(express.json());
app.use(express.static('public'));

// 🔥 LUEGO LAS RUTAS
const favoritosRoutes = require('./routes/favoritos');
app.use('/api/favoritos', favoritosRoutes);

const juegosRoutes = require('./routes/juegos');
app.use('/api/juegos', juegosRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🔥 Servidor corriendo en http://localhost:${PORT}`);
});