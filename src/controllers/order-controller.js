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

exports.getHistoryOrder = async (req, res, next) => {
  try {
    const historyOrder = await prisma.order.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(historyOrder);
  } catch (error) {
    next(error);
  }
};

exports.getTargetOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    // console.log(id);
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
    next(error);
  }
};

exports.getTrackingOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const output = await prisma.order.findFirst({
      where: {
        AND: [{ userId }, { id }],
      },
      include: {
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
    // console.log(output);
    res.status(200).json(output);
  } catch (error) {
    next(error);
  }
};

exports.checkOrdering = async (req, res, next) => {
  try {
    const output = await prisma.order.findFirst({
      where: {
        AND: [
          { userId: req.params.userId },
          {
            status: {
              in: ["WAITINGPREVIEW", "WAITINGDELIVERY", "COOKING"],
            },
          },
        ],
      },
    });
    // console.log(output);
    res.status(200).json(output);
  } catch (error) {
    next(error);
  }
};

exports.cancelOrdering = async (req, res, next) => {
  try {
    const output = await prisma.order.update({
      where: {
        id: req.params.id,
      },
      data: {
        comment: req.body.comment,
        status: "CANCEL",
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

exports.confirmDelivery = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const getOrder = await prisma.order.findFirst({
      where: {
        id: req.params.id,
      },
    });
    if (getOrder.userId != userId) {
      next(createError(400, "You can't update this order"));
    }
    const output = await prisma.order.update({
      where: {
        id: req.params.id,
      },
      data: {
        status: "COMPLETE",
      },
    });
    res.status(200).json(output);
  } catch (error) {
    next(error);
  }
};

exports.getSummary = async (req, res, next) => {
  try {
    const cancelResult =
      await prisma.$queryRaw`SELECT COUNT(id)  AS countOrder,date(createdAt) date FROM \`order\` where status="CANCEL" group by date order by date desc limit 7`;
    const newCancelResult = cancelResult.map((el) => {
      console.log(el);
      return { ...el, countOrder: Number(el.countOrder) };
    });

    const completeResult =
      await prisma.$queryRaw`SELECT COUNT(id)  AS countOrder,date(createdAt) date FROM \`order\` where status="COMPLETE" group by date order by date desc limit 7`;
    const newCompleteResult = completeResult.map((el) => {
      return { ...el, countOrder: Number(el.countOrder) };
    });

    const totalMember = await prisma.user.groupBy({
      by: ["role"],
      _count: {
        id: true,
      },
      where: {
        role: "MEMBER",
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to the start of the day

    const totalSummaryPrice =
      await prisma.$queryRaw`SELECT sum(summaryPrice) AS totalSummaryPrice,date(createdAt) date FROM \`order\` where status="COMPLETE" group by date order by date desc limit 1`;

    // console.log(totalSummaryPrice);
    res.status(200).json({
      newCompleteResult,
      newCancelResult,
      totalMember: totalMember[0]._count.id,
      totalToday: totalSummaryPrice[0],
    });
  } catch (error) {
    next(error);
  }
};
