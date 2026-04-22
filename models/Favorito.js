const mongoose = require('mongoose');

const FavoritoSchema = new mongoose.Schema({
  juegoId: String,
  nombre: String
});

module.exports = mongoose.models.Favorito || mongoose.model('Favorito', FavoritoSchema);