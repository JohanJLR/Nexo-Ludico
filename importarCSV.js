const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const Juego = require('./models/Juego');

// 🔌 conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Mongo conectado'))
  .catch(err => console.log(err));

const resultados = [];

fs.createReadStream('./data/juegos.csv')
  .pipe(csv())
  .on('data', (data) => {
    resultados.push({
      nombre: data.name,
      anio: parseInt(data.yearpublished) || null,

      // ⭐ ratings
      rating: parseFloat(data.average) || 0,
      bayesaverage: parseFloat(data.bayesaverage) || 0,

      // 🏆 ranking general
      rank: parseInt(data.rank) || null,

      // 👥 usuarios
      usersrated: parseInt(data.usersrated || data.users_rated || 0),

      // 🧩 expansión
      is_expansion: data.is_expansion === "1",

      // 🔥 CATEGORÍAS
      strategygames_rank: parseInt(data.strategygames_rank) || null,
      familygames_rank: parseInt(data.familygames_rank) || null,
      partygames_rank: parseInt(data.partygames_rank) || null,
      thematic_rank: parseInt(data.thematic_rank) || null,
      wargames_rank: parseInt(data.wargames_rank) || null
    });
  })
  .on('end', async () => {
    try {
      await Juego.deleteMany({}); // 🔥 limpiar
      await Juego.insertMany(resultados);

      console.log('🔥 Datos importados correctamente');
      process.exit();
    } catch (error) {
      console.error(error);
    }
  });