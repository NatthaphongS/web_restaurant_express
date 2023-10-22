const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = require("../models/prisma");
const {
  registerSchema,
  loginSchema,
  editSchema,
} = require("../validators/auth-validator");
const createError = require("../utils/create-error");

exports.register = async (req, res, next) => {
  try {
    const { value, error } = registerSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const checkEmailOrMobile = await prisma.user.findFirst({
      where: {
        OR: [{ mobile: value.mobile }, { email: value.email }],
      },
    });
    console.log(checkEmailOrMobile);
    if (
      checkEmailOrMobile?.email == value?.email &&
      checkEmailOrMobile?.mobile == value?.mobile
    ) {
      return next(createError(400, "Email and mobile number is already used"));
    }
    if (checkEmailOrMobile?.mobile == value.mobile) {
      return next(createError(400, "Mobile number is already used"));
    }
    if (checkEmailOrMobile?.email == value?.email) {
      return next(createError(400, "Email is already used"));
    }
    if (!value.email) {
      delete value.email;
    }

    value.password = await bcrypt.hash(value.password, 12);

    const user = await prisma.user.create({
      data: value,
    });
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

exports.editUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value, error } = editSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const checkEmailOrMobile = await prisma.user.findFirst({
      where: {
        OR: [{ mobile: value.mobile }, { email: value.email }],
        NOT: {
          id,
        },
      },
    });
    console.log(checkEmailOrMobile);
    if (
      checkEmailOrMobile?.email == value?.email &&
      checkEmailOrMobile?.mobile == value?.mobile
    ) {
      return next(createError(400, "Email and mobile number is already used"));
    }
    if (checkEmailOrMobile?.mobile == value.mobile) {
      return next(createError(400, "Mobile number is already used"));
    }
    if (checkEmailOrMobile?.email == value?.email) {
      return next(createError(400, "Email is already used"));
    }
    if (!value.email) {
      delete value.email; // make it to be null if it is empty string
    }
    if (!value.address) {
      delete value.address;
    }

    const user = await prisma.user.update({
      where: { id },
      data: value,
    });
    delete user.password;
    console.log(user);
    res.status(201).json({ user, message: "Editer Success!!" });
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

exports.getMe = (req, res, next) => {
  res.status(200).json({ user: req.user });
};
