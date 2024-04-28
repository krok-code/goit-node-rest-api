import Joi from "joi";

import { emailRegexp } from "../constants/user-constants.js";

const loginSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
  subscription: Joi.string(),
});

const registerSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).required(),
});

const subSchema = Joi.object({
  subscription: Joi.string().required(),
});

const userEmailSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
});

export default {
  subSchema,
  loginSchema,
  registerSchema,
  userEmailSchema,
};
