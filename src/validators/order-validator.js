const Joi = require("joi");

exports.createOrderSchema = Joi.object({
  deliveryAddress: Joi.string().trim().required(),
  summaryPrice: Joi.number().required(),
  userId: Joi.string().trim().required(),
  paymentImage: Joi.any().required(),
  orderDetail: Joi.array()
    .min(1)
    .items(
      Joi.object({
        menuId: Joi.number().required(),
        amount: Joi.number().required(),
        price: Joi.number().required(),
      })
    ),
});
