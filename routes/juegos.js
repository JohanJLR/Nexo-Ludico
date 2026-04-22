const express = require('express');
const router = express.Router();
const Juego = require('../models/Juego');


// 🔥 RECOMENDADOS
router.get('/recomendados', async (req, res) => {
  try {
    const juegos = await Juego
      .find()
      .sort({ rating: -1 })
      .limit(10);

    res.json(juegos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 🔥 MÁS BUSCADOS
router.get('/mas-buscados', async (req, res) => {
  try {
    const juegos = await Juego
      .find()
      .sort({ busquedas: -1 })
      .limit(10);

    res.json(juegos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 🔥 TRENDING SEMANAL
router.get('/trending', async (req, res) => {
  try {
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    const juegos = await Juego.find({
      ultimaBusqueda: { $gte: hace7Dias }
    })
    .sort({ busquedas: -1 })
    .limit(10);

    res.json(juegos);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 🔍 BUSCAR JUEGOS (con contador de búsquedas)
router.get('/', async (req, res) => {
  try {
    const { nombre, tipo, rating, usuarios, ranking, anio } = req.query;

    let query = {};

    // 🔍 BUSQUEDA POR NOMBRE
    if (nombre && nombre.trim() !== "") {
      const palabras = nombre.trim().split(/\s+/);

      query.nombre = { $regex: nombre.trim(), $options: 'i' };
    }

    // 🎯 FILTRO POR TIPO
    if (tipo === "estrategia") {
      query.strategygames_rank = { $gt: 0 };
    }

    if (tipo === "fiesta") {
      query.partygames_rank = { $gt: 0 };
    }

    if (tipo === "familiar") {
      query.familygames_rank = { $gt: 0 };
    }

    // 🔥 AQUI VAN LOS FILTROS AVANZADOS
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    if (usuarios) {
      query.usersrated = { $gte: Number(usuarios) };
    }

    if (ranking) {
      query.rank = { $lte: Number(ranking) };
    }

    if (anio) {
      query.anio = { $gte: Number(anio) };
    }

    // 🔥 CONSULTA FINAL
    const juegos = await Juego.find(query)
      .sort({rank: 1, rating: -1, usersrated: -1})
      .limit(50);

    res.json(juegos);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 GET - obtener juego por ID
router.get('/:id', async (req, res) => {
  try {
    const juego = await Juego.findById(req.params.id);

    if (!juego) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }

    res.json({
      ...juego._doc,
      descripcion: juego.descripcion || "No hay descripción disponible"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;