const prisma = require("../models/prisma");
const createError = require("../utils/create-error");
const { upload } = require("../utils/cloudinary-service");
const fs = require("fs/promises");
const { createOrderSchema } = require("../validators/order-validator");

exports.createOrder = async (req, res, next) => {
  try {
    const { value, error } = createOrderSchema.validate(req.body);
    if (error) {
      next(err);
    }
    const { deliveryAddress, summaryPrice, userId, orderDetail } = value;
    const createdOrder = await prisma.$transaction([
      prisma.order.create({
        data: {
          deliveryAddress,
          summaryPrice,
          userId,
          orderDetails: {
            create: orderDetail,
          },
        },
        include: {
          orderDetails: true,
        },
      }),
    ]);
    res.status(200).json({ message: "Created order success", createdOrder });
  } catch (error) {
    next(error);
  }
};
