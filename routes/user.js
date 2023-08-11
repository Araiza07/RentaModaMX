const express=require('express')
const router=express.Router();


const Users=require("../models/user")
const isLoggedIn = require('../middlewares/isLoggedIn');
const e = require('connect-flash');
const previousUrl = require('../middlewares/previousUrl')
const currentUrl=require("../middlewares/currentUrl")
const userC = require('../controller/userC'); // Asegúrate de que la ruta del controlador sea correcta


const Swal = require('sweetalert2');

const validarActivo= async(req,res,next)=>{
    const {id} = req.params;
    await Users.find(id, {verificado: false}, (error, result)=> {
      if (req.user.verificado == false) {
        req.logout();
      }
    })
  }

  router.get('/user/cart', currentUrl, isLoggedIn, userC.getUserCart);


  router.post('/user/cart/:prodId', previousUrl, isLoggedIn, userC.addToCart);

  router.delete('/user/cart/:userId/:prodId', previousUrl, isLoggedIn, userC.removeFromCart);


  router.get('/user/orders', currentUrl, isLoggedIn, userC.getUserOrders);

  router.delete('/user/cart/:userId/:prodId', previousUrl, isLoggedIn, userC.removeFromCart);


module.exports=router;