const express = require('express');
const router = express.Router();
const Favorito = require('../models/Favorito');

// 🔹 Guardar favorito
router.post('/', async (req, res) => {
  try {
    const { juegoId, nombre } = req.body;

    // 🔥 verificar si ya existe
    const existe = await Favorito.findOne({ juegoId });

    if (existe) {
      return res.status(400).json({ error: "Ya está en favoritos" });
    }

    const nuevo = new Favorito({ juegoId, nombre });
    await nuevo.save();

    res.json(nuevo);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Obtener favoritos
router.get('/', async (req, res) => {
  try {
    const favoritos = await Favorito.find();
    res.json(favoritos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 eliminar favorito
router.delete('/:id', async (req, res) => {
  try {
    await Favorito.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;