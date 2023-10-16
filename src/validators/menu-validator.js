const Joi = require("joi");

exports.createMenuSchema = Joi.object({
  menuImage: Joi.any().required(),
  menuName: Joi.string().trim().required(),
  price: Joi.number().required(),
  category: Joi.string().required(),
  status: Joi.string().required(),
  description: Joi.string().allow(""),
});
