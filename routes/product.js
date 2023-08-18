const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const isAdmin = require("../middlewares/isAdmin");
const productC = require("../controller/productC");
const multer = require("multer");
const previousUrl = require("../middlewares/previousUrl");
const currentUrl = require("../middlewares/currentUrl");
const path = require('path');
const Tallas = require("../models/tallas");
const Colores = require("../models/colores")

//factory method
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname,"/uploads/product"));
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-')+ file.originalname);
  },
});

const imageFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  const extname = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(extname)) {
    cb(null, true);
  } else {
      req.flash('status', 'Artículo añadido correctamente!!');
      res.redirect('/admin/products');
  }
};



const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
          return cb(new Error('Tipo de archivo incorrecto'));
          redirect ()
          
      }
      cb(null, true);
  }
});

router.get("/", currentUrl, productC.getIndex);
router.get("/productAll", currentUrl, productC.getProductAll);
router.get("/buscar", currentUrl, productC.searchProducts);
router.get("/novedades", currentUrl, productC.getNovedades);
router.get("/buscarCategoria", currentUrl, productC.searchCategoria);
router.get("/categorias", currentUrl, productC.getCategorias);
router.get("/products/new", isLoggedIn, isAdmin, productC.getNewProduct);
router.post('/products/new', isLoggedIn, isAdmin, upload.single('image'), productC.createProduct);
router.get("/products/:id", currentUrl, productC.getProductById);
router.get("/products/:id/edit", isLoggedIn, isAdmin, productC.getEditProduct);
router.patch("/products/:id", isLoggedIn, isAdmin, upload.single("image"), productC.editProduct);
router.delete("/products/:id/delete", isLoggedIn, isAdmin, productC.deleteProduct);
router.post("/products/:id/reviews", isLoggedIn, productC.createReview);
router.get("/products/:id/reviews/:rev_id", isLoggedIn, productC.getEditReview);
router.patch("/products/:id/reviews/:rev_id", isLoggedIn, productC.editReview);
router.delete("/products/:id/reviews/:rev_id", isLoggedIn, productC.deleteReview);

module.exports = router;
