const express = require("express");

const orderController = require("../controllers/order-controller");
const isMemberMiddleWare = require("../middlewares/isMember");
const isAdminMiddleWare = require("../middlewares/isAdmin");
const uploadMulterMiddleWare = require("../middlewares/upload-multer");
const authenticateMiddleWare = require("../middlewares/authenticate");

const router = express.Router();

router.post(
  "/create",
  isMemberMiddleWare,
  uploadMulterMiddleWare.single("paymentImage"),
  orderController.createOrder
);
router.patch("/update/:id", isAdminMiddleWare, orderController.updateOrder);
router.patch("/cancle/:id", isAdminMiddleWare, orderController.cancleOrdering);
router.get("/allOrders", isAdminMiddleWare, orderController.getAllOrders);
router.get(
  "/historyOrders",
  authenticateMiddleWare,
  orderController.getHistoryOrder
);
router.get(
  "/orderTarget/:id",
  isAdminMiddleWare,
  orderController.getTargetOrder
);
router.get(
  "/getTrackingOrder/:id",
  authenticateMiddleWare,
  orderController.getTrackingOrder
);
router.get("/checkOrdering/:userId", orderController.checkOrdering);
router.patch(
  "/confirmDelivery/:id",
  authenticateMiddleWare,
  orderController.confirmDelivery
);
router.get("/getSummary", isAdminMiddleWare, orderController.getSummary);

module.exports = router;
