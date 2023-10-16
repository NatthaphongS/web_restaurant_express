const prisma = require("../models/prisma");
const createError = require("../utils/create-error");
const { upload } = require("../utils/cloudinary-service");
const { createMenuSchema } = require("../validators/menu-validator");
const fs = require("fs/promises");

exports.createMenu = async (req, res, next) => {
  try {
    const imgURL = await upload(req.file.path);
    const data = { ...req.body, menuImage: imgURL, price: +req.body.price };
    const { value, error } = createMenuSchema.validate(data);
    if (error) {
      next(err);
    }
    const newMenu = await prisma.menu.create({
      data: value,
    });
    res.status(200).json({ message: "Create menu success", newMenu });
  } catch (err) {
    next(createError(400, err));
  } finally {
    fs.unlink(req.file.path);
  }
};

exports.getMenu = async (req, res, next) => {
  try {
    const { category } = req.params;
    // console.log(category);
    const menus = await prisma.menu.findMany({
      where: {
        category: category,
      },
    });
    res.status(200).json({ menus });
  } catch (err) {
    next(err);
  }
};

exports.getAllMenu = async (req, res, next) => {
  try {
    const allMenus = await prisma.menu.findMany({
      where: {},
    });
    res.status(200).json({ allMenus });
  } catch (err) {
    next(err);
  }
};

exports.deleteMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.menu.delete({
      where: {
        id: +id,
      },
    });
    res.status(200).json({ message: "Delete success" });
  } catch (err) {
    next(err);
  }
};

exports.editMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(req.body);
    let data = { ...req.body, price: +req.body.price };
    if (req.file) {
      const imgURL = await upload(req.file.path);
      data = { ...data, menuImage: imgURL };
    }
    const { value, error } = createMenuSchema.validate(data);
    if (error) {
      next(error);
    }
    const editMenu = await prisma.menu.update({
      data: value,
      where: {
        id: +id,
      },
    });
    res.status(200).json({ message: "Edit menu success", editMenu });
  } catch (err) {
    next(err);
  }
};
