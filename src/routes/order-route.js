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
router.patch("/update/:id", isAdminMiddleWare, orderController.updateOrder);
router.patch("/cancle/:id", orderController.cancleOrdering);
router.get("/allOrders", isAdminMiddleWare, orderController.getAllOrders);
router.get(
  "/orderTarget/:id",
  isAdminMiddleWare,
  orderController.getTargetOrder
);
router.get("/getTrackingOrder/:id", orderController.getTrackingOrder);
router.get("/checkOrdering/:userId", orderController.checkOrdering);

module.exports = router;
