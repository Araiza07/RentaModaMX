const Users = require('../models/user'); // Asegúrate de importar el modelo adecuado para la colección de usuarios
const Product=require('../models/product')
const mongoose=require('mongoose')

const getUserCart = async (req, res) => {
  try {
    const user = await Users.findById(req.user._id).populate('cart.item');

    for (let i = user.cart.length - 1; i >= 0; i--) {
      if (user.cart[i].item === null) {
        user.cart.splice(i, 1);
        await user.save();
      }
    }

    const data = user.cart;
    res.render('user/cart', { data });
  } catch (e) {
    res.status(404).render('error/error', { "status": "404" });
  }
};
const addToCart = async (req, res) => {
    try {
      const { prodId } = req.params;
      const userData = await Users.findById(req.user._id);
      const product = await Product.findById(prodId);
      let flag = 0;
      let cartLimit = true;
  
      for (const user of userData.cart) {
        if (prodId === user.item) {
          user.quantity += Number(req.body.quantity);
          if (user.quantity > 5) {
            cartLimit = false;
          }
          flag = 1;
          break;
        }
      }
  
      if (flag !== 1) {
        const obj = {
          item: product,
          quantity: Number(req.body.quantity),
        };
        userData.cart.push(obj);
        await userData.save();
        res.redirect('/user/cart/');
      } else {
        if (cartLimit === false) {
          req.flash('error', 'No puede añadir más de 5 artículos.');
          res.redirect(`/products/${prodId}`);
        } else {
          await userData.save();
          res.redirect('/user/cart/');
        }
      }
    } catch (e) {
      res.status(404).render('error/error', { "status": "404" });
    }
  };

const removeFromCart = async (req, res) => {
    try {
      const { userId, prodId } = req.params;
      const data = await Users.findById(userId);
  
      try {
        data.cart.splice(data.cart.findIndex((e) => e.item == prodId), 1);
        await data.save();
        req.flash('success', 'Artículo eliminado de su carrito.');
        res.redirect('/user/cart');
      } catch (e) {
        req.flash('error', 'Hubo un problema al borrar del carrito.');
        res.redirect('/user/cart');
      }
    } catch (e) {
      console.log(e);
      res.status(404).render('error/error', { "status": "404" });
    }
  };
  const getUserOrders = async (req, res) => {
    try {
      const data = await Users.findById(req.user._id).populate('orders');
      await data.populate({ path: 'orders.orderList.item', model: Product }).execPopulate();
      const orders = data.orders;
      res.render('user/orders', { orders });
      // res.send(orders)
    } catch (e) {
      console.log(e);
      res.status(404).render('error/error', { "status": "404" });
    }
  };

  const getMapaSitio = async (req, res) => {
    try {
      res.render('utils/mapaSitio');
    } catch (e) {
      console.log(e);
      res.status(404).render('error/error', { status: '404' });
    }
  };
  

module.exports = {
  getUserCart,
  addToCart,
  removeFromCart,
  getUserOrders,
  getMapaSitio

};

