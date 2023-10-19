const prisma = require("../models/prisma");
const createError = require("../utils/create-error");
const { upload } = require("../utils/cloudinary-service");
const fs = require("fs/promises");
const { createOrderSchema } = require("../validators/order-validator");

exports.createOrder = async (req, res, next) => {
  try {
    const imgURL = await upload(req.file.path);
    const data = {
      ...req.body,
      paymentImage: imgURL,
      summaryPrice: +req.body.summaryPrice,
      orderDetail: JSON.parse(req.body.orderDetail),
    };
    const { value, error } = createOrderSchema.validate(data);
    if (error) {
      next(error);
    }
    // console.log(error);
    // console.log(value);
    const { deliveryAddress, summaryPrice, userId, paymentImage, orderDetail } =
      value;
    const output = await prisma.$transaction([
      prisma.order.create({
        data: {
          deliveryAddress,
          summaryPrice,
          userId,
          paymentImage,
          orderDetails: {
            create: orderDetail,
          },
        },
        include: {
          orderDetails: true,
        },
      }),
    ]);

    const createdOrder = output[0];
    res.status(200).json({ message: "Created order success", createdOrder });
  } catch (error) {
    next(error);
  } finally {
    fs.unlink(req.file.path);
  }
};

exports.updateOrder = async (req, res, next) => {
  try {
    console.log("hello update order");
    res.status(200).json({ message: "hello update order" });
  } catch (error) {
    console.log(error);
  }
};

exports.getOrdering = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const ordering = await prisma.order.findFirst({
      where: {
        AND: [
          { userId },
          {
            status: {
              in: ["WAITINGPREVIEW", "COOKING", "WAITINGDELIVERY"],
            },
          },
        ],
      },
      include: {
        orderDetails: {
          include: {
            menu: {
              select: {
                menuName: true,
              },
            },
          },
        },
      },
    });
    res.status(200).json(ordering);
  } catch (error) {
    next(error);
  }
};
