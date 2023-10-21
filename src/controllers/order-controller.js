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

exports.getAllOrders = async (req, res, next) => {
  try {
    const allOrders = await prisma.order.findMany({
      orderBy: {
        updatedAt: "asc",
      },
    });
    res.status(200).json(allOrders);
  } catch (error) {
    next(error);
  }
};
exports.filterOrderById = async (req, res, next) => {
  try {
    const filterOrder = await prisma.order.findMany({
      where: {
        id: req.params.id,
      },
      orderBy: {
        updatedAt: "asc",
      },
    });
    res.status(200).json(filterOrder);
  } catch (error) {
    next(error);
  }
};

exports.getTargetOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(id);
    const output = await prisma.order.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        deliveryAddress: true,
        summaryPrice: true,
        paymentImage: true,
        comment: true,
        status: true,
        orderDetails: {
          select: {
            id: true,
            amount: true,
            price: true,
            menu: {
              select: {
                menuName: true,
              },
            },
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            mobile: true,
          },
        },
      },
    });
    res.status(200).json(output);
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

exports.cancleOrdering = async (req, res, next) => {
  try {
    const output = await prisma.order.update({
      where: {
        id: req.params.id,
      },
      data: {
        comment: req.body.comment,
        status: "CANCLE",
      },
    });
    res.status(200).json(output);
  } catch (error) {
    next(error);
  }
};

exports.updateOrder = async (req, res, next) => {
  try {
    const output = await prisma.order.update({
      where: {
        id: req.params.id,
      },
      data: {
        status: req.body.status,
      },
    });
    res.status(200).json(output);
  } catch (error) {
    next(error);
  }
};
