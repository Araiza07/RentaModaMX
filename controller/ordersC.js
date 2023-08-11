const Razorpay = require("razorpay");
const { v4: uuid } = require("uuid");
const Orders = require("../models/order");
const Users = require("../models/user");

require('dotenv').config();

const instance = new Razorpay({
  key_id: process.env.RZP_key_id,
  key_secret: process.env.RZP_key_secret
});

const createOrder = async (req, res) => {
  try {
    let reciept = "ODRCPT_ID_" + uuid().slice(-12, -1);
    const data = req.body;
    data.receipt = reciept;
    instance.orders
      .create(data)
      .then((order) => {
        order.rzp_key = process.env.RZP_key_id;
        res.send(order);
      })
      .catch((err) => {
        req.flash('error', "Se ha producido un problema en la red, inténtelo de nuevo.");
        res.send({ "failure": "Este pago no puede efectuarse " });
      });
  } catch (e) {
    console.log(e);
    res.status(404).render('error/error', { "status": "404" });
  }
};

const createPedido = async (req, res) => {
  try {
    const code = Math.floor(100000 + Math.random() * 900000000).toString();
    const userObj = await Users.findById(req.user._id);
    const data = {
      user: req.user,
      orderid: code,
      orderList: userObj.cart,
      tarjeta: req.body.tarjeta,
      cve: req.body.cve,
      nombreFac: req.body.nombreFac,
      colonia: req.body.colonia,
      calle: req.body.calle,
      cp: req.body.cp,
      ciudad: req.body.ciudad,
      estado: req.body.estado,
      ref1: req.body.ref1,
      telefono: req.body.telefono,
      finalPrice: req.body.finalPrice,
    };
    const orderObj = new Orders(data);
    await orderObj.save();
    console.log(orderObj);
    userObj.orders.push(orderObj);
    userObj.cart.splice(0);
    await userObj.save();
    req.flash("success", "Su pedido se ha realizado correctamente");
    res.redirect("/user/cart");
  } catch (err) {
    console.log("Problema con las ordenes");
    console.log(err);
    res.status(404).render('error/error', { "status": "404" });
  }
};

const getPaymentError = (req, res) => {
  try {
    const error = req.session.paymentError;
    res.render("user/paymentError", { error });
  } catch (e) {
    console.log(e);
    res.status(404).render('error/error', { "status": "404" });
  }
};

const handlePaymentFail = (req, res) => {
  try {
    req.session.paymentError = req.body.error;
    res.send({ "redirect": `/user/payment/${req.body.error.payment_id}/${req.body.error.payment_id}` });
  } catch (e) {
    console.log(e);
    res.status(404).render('error/error', { "status": "404" });
  }
};

module.exports = {
  createOrder,
  createPedido,
  getPaymentError,
  handlePaymentFail,
};
