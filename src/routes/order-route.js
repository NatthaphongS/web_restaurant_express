const express = require("express");

const orderController = require("../controllers/order-controller");
const isMemberMiddleWare = require("../middlewares/isMember");

const router = express.Router();

router.post("/create", isMemberMiddleWare, orderController.createOrder);

module.exports = router;
