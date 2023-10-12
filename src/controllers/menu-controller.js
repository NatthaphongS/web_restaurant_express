const prisma = require("../models/prisma");
const createError = require("../utils/create-error");
const { upload } = require("../utils/cloudinary-service");
const { createMenuSchema } = require("../validators/menu-validator");
const fs = require("fs/promises");

exports.createMenu = async (req, res, next) => {
  try {
    console.log("-------", req.body);
    console.log("=======", req.file);

    const imgURL = await upload(req.file.path);
    const data = { ...req.body, menuImage: imgURL, price: +req.body.price };
    const { value, error } = createMenuSchema.validate(data);
    if (error) {
      next(err);
    }
    const newMenu = await prisma.menu.create({
      data: value,
    });
    res.status(200).json({ message: "Create menu success" });
  } catch (err) {
    next(createError(400, err));
  } finally {
    fs.unlink(req.file.path);
  }
};
