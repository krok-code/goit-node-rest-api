import jwt from 'jsonwebtoken';

import * as authServices from '../services/authServices.js';

import HttpError from '../helpers/HttpError.js';

import ctrlWrapper from '../decorator/ctrlWrapper.js';

const { SECRET_KEY } = process.env;

const register = async (req, res) => {
  const { email } = req.body;
  const user = await authServices.findUser({ email });
  if (user) {
    throw HttpError(409, 'Email in use');
  }

  const newUser = await authServices.register(req.body);
  if (!newUser) {
    throw HttpError(404, 'Not found');
  }
  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await authServices.findUser({ email });
  if (!user) {
    throw HttpError(401, 'Email or password is wrong');
  }

  const passwordCompare = await authServices.validatePassword(
    password,
    user.password
  );
  if (!passwordCompare) {
    throw HttpError(401, 'Email or password is wrong');
  }

  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '23h' });

  await authServices.updateUser(user._id, { token });

  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  res.json({
    email,
    subscription,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await authServices.updateUser(_id, { token: '' });

  res.status(204).json();
};

const updateSubscriptionUsers = async (req, res) => {
  const { _id } = req.user;
  const { subscription } = req.body;
  await authServices.updateSubscription(_id, { subscription });

  res.status(200).json({ message: `Subscription changed to ${subscription}` });
};

export default {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateSubscriptionUsers: ctrlWrapper(updateSubscriptionUsers),
};
