const express = require("express");
const router = express.Router();
const adminC = require("../controller/adminC");
const isLoggedIn = require("../middlewares/isLoggedIn");
const isAdmin = require("../middlewares/isAdmin");

//change of responsability

router.get("/admin/home", isLoggedIn, isAdmin, adminC.getAdminHome);
router.get("/admin/products", isLoggedIn, isAdmin, adminC.getAdminProducts);
router.get("/admin/categorias", isLoggedIn, isAdmin, adminC.getAdminCategorias);
router.post("/admin/categoria", isLoggedIn, isAdmin, adminC.createCategoria);
router.get("/admin/user", isLoggedIn, isAdmin, adminC.getAdminUser);
router.delete("/admin/user/:id", isLoggedIn, isAdmin, adminC.deleteAdminUser);
router.get("/admin/orders", isLoggedIn, isAdmin, adminC.getAdminOrders);

module.exports = router;
