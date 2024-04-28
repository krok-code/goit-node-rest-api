import Joi from "joi";

import { emailRegexp, phoneRegexp } from "../constants/contact-constants.js";

const createContactSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().pattern(emailRegexp).required(),
  phone: Joi.string().pattern(phoneRegexp).required(),
  favorite: Joi.boolean(),
});

const updateContactSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().pattern(emailRegexp),
  phone: Joi.string().pattern(phoneRegexp),
  favorite: Joi.boolean(),
});

const updateStatusSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

export const schemas = {
  createContactSchema,
  updateContactSchema,
  updateStatusSchema,
};
