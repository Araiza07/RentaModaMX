const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const urlStoring = require("../middlewares/previousUrl");
const currentUrl = require("../middlewares/currentUrl");
const orderC = require("../controller/ordersC");

router.post("/user/order", isLoggedIn, orderC.createOrder);
router.post('/pedido', isLoggedIn, orderC.createPedido);
router.get("/user/payment/:payment_id/:error_code", isLoggedIn, orderC.getPaymentError);
router.post("/user/order/paymentfail", isLoggedIn, orderC.handlePaymentFail);

module.exports = router;
