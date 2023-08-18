const Product = require("../models/product");
const Categorias = require("../models/categorias");
const Reviews = require("../models/reviews");
const Users = require("../models/user");
const isAdmin = require("../middlewares/isAdmin");
const path = require("path");
const fs = require("fs");
const { v4: uuid } = require("uuid");
const Tallas = require("../models/tallas");
const Colores = require("../models/colores")


const getIndex = async (req, res) => {
  try {
    const cat = await Categorias.find({});
    const data = await Product.find({});
    res.render("products/index", { data, cat });
  } catch (err) {
    console.log(err);
    res.status(404).render("error/error", { status: "404" });
  }
};

const getProductAll = async (req, res) => {
  try {
    const data = await Product.find({});
    res.render("products/navegacion/all", { data });
  } catch (err) {
    console.log(err);
    res.status(404).render("error/error", { status: "404" });
  }
};

const searchProducts = async (req, res) => {
  try {
    const dato = req.query.buscar
    const data = await Product.find({name: {$regex: '.*'+dato+'.*',$options: "i"}});
    res.render("products/navegacion/all", { data });
  } catch (err) {
    console.log(err);
    res.status(404).render("error/error", { status: "404" });
  }
};

const getNovedades = async (req, res) => {
  try {
    const fechaActual = new Date('2023-04-01T08:30:00Z');
    const fechFinal = new Date('2023-04-30T08:30:00Z')
    const data = await Product.find({ created_at: { $gte: fechaActual, $lte: fechFinal} }).sort({ created_at: 1 }); 
    res.render('products/navegacion/Novedades', { data }); 
  } catch (err) {
    console.log(err);
    res.status(404).render("error/error", { status: "404" });
  }
};

const searchCategoria = async (req, res) => {
  try {
    const cat = await Categorias.find({});
    const dato = req.query.buscar
    const data = await Product.find({categoria: {$regex: '.*'+ dato +'.*',$options: "i"}});
    res.render("products/navegacion/Categorias",  { cat , data })
  } catch (err) {
    console.log(err);
    res.status(404).render("error/error", { status: "404" });
  }
};

const getCategorias = async (req, res) => {
  try {
    const cat = await Categorias.find({});
    const data = await Product.find({});
    res.render('products/navegacion/Categorias', {data , cat } );
  } catch (err) {
    console.log(err);
    res.status(404).render("error/error", { status: "404" });
  }
};

const getNewProduct = async (req, res) => {
  try {
    const cat = await Categorias.find({});
    const talla = await Tallas.find({});
    const color = await Colores.find({});
    res.render("products/new", {cat, talla,color,  messages: req.flash()});
  } catch (e) {
    console.log(e);
    
    res.status(404).render("error/error", { status: "404" });
   
  }
};



const createProduct = async (req, res) => {
  try {
    let data = req.body;
    
    // Asegurarse de que la talla, el color y la imagen se incluyan en el objeto `data`
    data.talla = req.body.talla;
    data.color = req.body.color;
    data.image = req.body.image;
    
    if (data.price <= Number(100000)) {
      let file;
      try {
        console.log(req.file.path);
        file = req.file.path; // Obtener la ubicación temporal del archivo
        data.image = { data: fs.readFileSync(file), contentType: req.file.mimetype }; // Leer el archivo y obtener los datos binarios
      } catch {
        data.image = null;
      }
      
      // Crear el producto con los datos incluyendo talla, color e imagen
      await Product.create(data);

      req.flash('status', 'Artículo añadido correctamente!!');
      res.redirect('/admin/products');
    } else {
      req.flash('error', 'No se puede fijar un precio superior a 100000');
      res.redirect('/products/new');
    }
  } catch (e) {
    console.log(e);
    if (error.message === 'Solo se permiten archivos de imagen.') {
      req.flash('error', error.message);
      res.redirect('/products/new');
    } else {
      const errorMessage = 'Error al subir el archivo: ' + error.message;
      res.status(400).send(errorMessage);
      res.status(404).render('error/error', { status: '404' });
    }
  }
};



const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Product.findById(id).populate("reviews");
    res.render("products/item", { data });
    
  } catch (e) {
    console.log(e);
    res.status(404).render("error/error", { status: "404" });
  }
};

const getEditProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const cat = await Categorias.find({});
    const talla = await Tallas.find({});
    const color = await Colores.find({});
    const data = await Product.findById(id);
    res.render("products/edit", { data,cat , talla,color });
  } catch (e) {
    console.log(e);
    res.status(404).render("error/error", { status: "404" });
  }
};






//observer
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if(data.price<=Number(100000)){
      let file;
      try {
        console.log(req.file.path);
        file = req.file.path; // Obtener la ubicación temporal del archivo
        data.image = { data: fs.readFileSync(file), contentType: req.file.mimetype }; // Leer el archivo y obtener los datos binarios
      } catch {
        data.image = null;
      }
      
        await Product.findByIdAndUpdate(id, data);

        console.log("Database updated");
        req.flash("status", "Se han editado los detalles del artículo y se ha conseguido");
        res.redirect("/admin/products");
      }
      else{
        req.flash('error',"No se puede fijar un precio superior a 100000");
        res.redirect(`/products/${id}/edit`)
      }
  } catch (e) {
    console.log(e);
    res.status(404).render("error/error", { status: "404" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleting = await Product.findById(id);
    await Product.findByIdAndDelete(id);
    console.log("Product Deleted...");
    req.flash(
      "status",
      `El artículo "${deleting.name}"se ha eliminado correctamente..`
    );
    res.redirect("/admin/products");
  } catch (e) {
    res.status(404).render("error/error", { status: "404" });
  }
};

const createReview = async (req, res) => {
  try {
    const data = req.body;
    data.user = req.user.username;
    data.date = Date.now();
    const { id } = req.params;
    const productObj = await Product.findById(id);
    const reviewObj = new Reviews(data);
    productObj.reviews.push(reviewObj);
    await productObj.save();
    await reviewObj.save();
    console.log("Comentario guardado en la base de datos");
    req.flash("success","Su opinión se ha añadido correctamente !")
    res.redirect(`/products/${id}`);
    
  } catch (e) {
    res.status(404).render("error/error", { status: "404" });
  }
};

const getEditReview = async (req, res) => {
  try {
    const { id, rev_id } = req.params;
    try {
      const data = await Reviews.findById(rev_id);
      res.render("reviews/edit", { data, id, rev_id });
    } catch (e) {
      req.flash("error", "Lo sentimos Hemos encontrado un problema");
      res.redirect(`/products/${id}`);
    }
  } catch (e) {
    res.status(404).render("error/error", { status: "404" });
  }
};

const editReview = async (req, res) => {
  try {
    const { id, rev_id } = req.params;
    const data = req.body;
    data.date = Date.now();
    try {
      await Reviews.findByIdAndUpdate(rev_id, data);
      req.flash("success", "Su comentario se ha actualizado correctamente");
      res.redirect(`/products/${id}`);
    } catch (e) {
      req.flash("error", "Ha habido un problema al actualizar tu comentario");
      res.redirect(`/products/${id}`);
    }
  } catch (e) {
    res.status(404).render("error/error", { status: "404" });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id, rev_id } = req.params;
    try {
      await Reviews.findByIdAndDelete(rev_id);
      req.flash("success", "Su comentario se ha eliminado correctamente");
      res.redirect(`/products/${id}`);
    } catch (e) {
      req.flash("error", "Ha habido un problema al actualizar tu comentario");
      res.redirect(`/products/${id}`);
    }
  } catch (e) {
    res.status(404).render("error/error", { status: "404" });
  }
};

module.exports = {
  getIndex,
  getProductAll,
  searchProducts,
  getNovedades,
  searchCategoria,
  getCategorias,
  createProduct,
  getNewProduct,
  getProductById,
  getEditProduct,
  editProduct,
  deleteProduct,
  createReview,
  getEditReview,
  editReview,
  deleteReview,
  
};
