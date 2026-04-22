const mongoose = require('mongoose');

const JuegoSchema = new mongoose.Schema({
  nombre: String,
  anio: Number,
  strategygames_rank: Number,
  familygames_rank: Number,
  partygames_rank: Number,
  thematic_rank: Number,
  wargames_rank: Number,
  descripcion: String,

  // ⭐ ratings
  rating: Number,
  average: Number,
  bayesaverage: Number,

  // 🏆 rankings
  rank: Number,
  familygames_rank: Number,
  strategygames_rank: Number,
  partygames_rank: Number,

  // 👥 popularidad
  usersrated: Number,

  // 🧩 tipo
  is_expansion: Boolean,

  // 🔥 sistema app
  busquedas: { type: Number, default: 0 },
  ultimaBusqueda: Date
});

JuegoSchema.index({ nombre: "text" });

module.exports = mongoose.models.Juego || mongoose.model('Juego', JuegoSchema);