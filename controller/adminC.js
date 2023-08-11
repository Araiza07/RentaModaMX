const Product = require('../models/product');
const Order = require('../models/order');
const Categoria = require('../models/categorias');
const User = require("../models/user");

const getAdminHome = (req, res) => {
  try {
    res.render("admin/adminHome.ejs");
  } catch (e) {
    console.log(e);
    res.status(404).render('error/error', { "status": "404" });
  }
};

const getAdminProducts = async (req, res) => {
  try {
    const data = await Product.find({});
    res.render("admin/adminProducts.ejs", { data });
  } catch (e) {
    console.log(e);
    res.status(404).render('error/error', { "status": "404" });
  }
};

const getAdminCategorias = async (req, res) => {
  try {
    const data = await Categoria.find({});
    res.render("admin/adminCategoria", { data });
  } catch (e) {
    console.log(e);
    res.status(404).render('error/error', { "status": "404" });
  }
};

const createCategoria = async (req, res) => {
  try {
    const cat = new Categoria({
      categorias: req.body.categorias
    });
    await Categoria.create(cat);

    req.flash("status", "Categoria registrada!!");
    res.redirect("/admin/categorias");
  } catch (e) {
    console.log(e);
    res.status(404).render("error/error", { status: "404" });
  }
};

const getAdminUser = async (req, res) => {
  try {
    const person = await User.find({}).populate({
      path: 'orders cart.item',
      populate: {
        path: 'orderList.item',
        model: Product
      }
    });
    res.render('admin/adminUser', { person });
  }
  catch (e) {
    console.log(e);
    res.status(404).render('error/error', { "status": "404" });
  }
};

const deleteAdminUser = async (req, res) => {
  try {
    const { id } = req.params
    try {
      await User.findByIdAndDelete(id);
      req.flash('success', `El usuario se ha eliminado correctamente !`)
      res.redirect('/admin/user');
    }
    catch (err) {
      req.flash('error', 'Lo sentimos Ha habido un problema al borrar el usuario').
        res.redirect('/admin/user')
    }
  } catch (e) {
    console.log(e);
    res.status(404).render('error/error', { "status": "404" });
  }
};

const getAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user').populate({
      path: 'orderList.item',
      model: Product
    })

    res.render('admin/adminOrders', { orders });
  }
  catch (e) {
    console.log(e);
    res.status(404).render('error/error', { "status": "404" });
  }
};

module.exports = {
  getAdminHome,
  getAdminProducts,
  getAdminCategorias,
  createCategoria,
  getAdminUser,
  deleteAdminUser,
  getAdminOrders
};
