const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = require("../models/prisma");
const { registerSchema, loginSchema } = require("../validators/auth-validator");
const createError = require("../utils/create-error");

exports.register = async (req, res, next) => {
  try {
    const { value, error } = registerSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    value.password = await bcrypt.hash(value.password, 12);
    res.json(value);

    const user = await prisma.user.create({
      data: value,
    });
    console.log(user);
    delete user.password;
    const payload = { userId: user.id, userRole: user.role };
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY || "keyerror",
      { expiresIn: process.env.JWT_EXPIRE }
    );
    res.status(201).json({ accessToken, user, message: "Register Success!!" });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { value, error } = loginSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ mobile: value.emailOrMobile }, { email: value.emailOrMobile }],
      },
    });
    if (!user) {
      return next(createError(400, "Invalid username or password"));
    }
    const isMatch = await bcrypt.compare(value.password, user.password);
    if (!isMatch) {
      return next(createError(400, "Invalid username or password"));
    }
    delete user.password;
    const payload = { userId: user.id, userRole: user.role };
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY || "keyerror",
      { expiresIn: process.env.JWT_EXPIRE }
    );
    res.status(201).json({ accessToken, user, message: "Login Success!!" });
  } catch (err) {
    next(err);
  }
};
