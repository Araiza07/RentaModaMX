const express = require('express');
const passport = require('passport');
const router = express.Router();
const Producto = require('../models/Productos');
const multer = require('multer');


router.get('/', (req, res, next) => {
  res.render('signin');
});

router.get('/signup', (req, res, next) => {
  res.render('signup');
});

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/signin',
  failureRedirect: '/signup',
  passReqToCallback: true
}));

router.get('/signin', (req, res, next) => {
  res.render('signin');
});

router.post('/signin', passport.authenticate('local-signin', {
  successRedirect: '/profile',
  failureRedirect: '/signin',
  passReqToCallback: true
}));

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

router.use(isAuthenticated); // Llamada al middleware antes de las rutas protegidas

router.get('/profile', (req, res, next) => {
  res.render('profile');
});

router.get('/create', (req, res, next) => {
  res.render('create');
});

router.get('/dashboard', (req, res, next) => {
  res.send('dashboard');
});

// Subir imágenes
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

router.get('/productos',async  (req, res, next) => {
  try {
    const data = await Producto.find({})
    res.render('productos',{data});

  } catch (error) {
    console.log(error)
  }
});




module.exports = router;