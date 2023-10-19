const express = require("express");

const orderController = require("../controllers/order-controller");
const isMemberMiddleWare = require("../middlewares/isMember");
const isAdminMiddleWare = require("../middlewares/isAdmin");
const uploadMulterMiddleWare = require("../middlewares/upload-multer");

const router = express.Router();

router.post(
  "/create",
  isMemberMiddleWare,
  uploadMulterMiddleWare.single("paymentImage"),
  orderController.createOrder
);
router.patch(
  "/update/:orderId",
  isAdminMiddleWare,
  orderController.updateOrder
);
router.get("/getOrdering/:userId", orderController.getOrdering);

module.exports = router;
