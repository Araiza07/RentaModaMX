/*
const express = require('express');
const router = express.Router();
const Producto = require('../models/Productos');
const multer = require('multer');


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

var upload = multer({ storage: storage })

router.post("/create", upload.single("imagen"), async (req, res) => {
  try {
    if (!req.file) {
      throw new Error('No se ha adjuntado ningún archivo');
    }

    const producto = new Producto({
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      precio: req.body.precio,
      imagen: req.file.filename,
    });

    console.log(producto)

    await producto.save();
    
    req.session.message = {
      type: 'success',
      message: 'Producto añadido'
    };
    res.redirect('/create');
  } catch (error) {
    res.render("error", { errorMessage: error.message });
    console.log(error)
  }
});
*/