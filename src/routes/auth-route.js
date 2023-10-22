const express = require("express");

const authController = require("../controllers/auth-controller");
const authenticateMiddleWare = require("../middlewares/authenticate");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.patch("/editUser/:id", authController.editUser);
router.get("/me", authenticateMiddleWare, authController.getMe);

module.exports = router;
