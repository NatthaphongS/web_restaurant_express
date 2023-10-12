const express = require("express");

const menuController = require("../controllers/menu-controller");
const isAdminMiddleWare = require("../middlewares/isAdmin");
const uploadMulterMiddleWare = require("../middlewares/upload-multer");

const router = express.Router();

router.post(
  "/create",
  isAdminMiddleWare,
  uploadMulterMiddleWare.single("menuImage"),
  menuController.createMenu
);

module.exports = router;
