import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import Jimp from 'jimp';
import path from 'path';
import gravatar from 'gravatar';

import * as authServices from '../services/authServices.js';

import HttpError from '../helpers/HttpError.js';
import sendEmail from '../helpers/sendEmail.js';

import ctrlWrapper from '../decorator/ctrlWrapper.js';

const { SECRET_KEY } = process.env;

const avatarsPath = path.resolve('public', 'avatars');

const register = async (req, res) => {
  const { email } = req.body;
  const user = await authServices.findUser({ email });
  if (user) {
    throw HttpError(409, 'Email in use');
  }
  const avatarURL = gravatar.url(email);
  const newUser = await authServices.register({ ...req.body, avatarURL });
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
const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await authServices.findUser({ verificationToken });

  if (!user) {
    throw HttpError(404, 'User not found');
  }

  await authServices.updateUser(
    { _id: user._id },
    { verify: true, verificationToken: ' ' }
  );

  res.status(200).json({
    message: 'Verification successful',
  });
};

const resendEmailVerify = async (req, res) => {
  const { email } = req.body;
  const user = await authServices.findUser({ email });
  if (!user) {
    throw HttpError(404, 'User not found');
  }
  if (user.verify) {
    throw HttpError(400, 'Verification has already been passed');
  }
  const verifyEmail = {
    to: email,
    subject: 'Verify your email',
    html: `<a href="${BASE_URL}/api/users/verify/${user.verificationToken}" target="_blank" >Click verify email</a>`,
  };
  await sendEmail(verifyEmail);
  res.status(200).json({
    message: 'Verification email sent',
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await authServices.findUser({ email });
  if (!user) {
    throw HttpError(401, 'Email or password is wrong');
  }
  if (!user.verify) {
    throw HttpError(401, 'Email not verified');
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

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: oldPath, filename } = req.file;

  const newPath = path.join(avatarsPath, filename);

  Jimp.read(oldPath, (err, img) => {
    if (err) throw err;
    img.resize(250, 250).write(newPath);
  });

  await fs.rename(oldPath, newPath);

  const avatarURL = path.join('avatars', filename);
  await authServices.setAvatar(_id, avatarURL);
  return res.json({ avatarURL });
};

export default {
  register: ctrlWrapper(register),
  verifyEmail: ctrlWrapper(verifyEmail),
  resendEmailVerify: ctrlWrapper(resendEmailVerify),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateSubscriptionUsers: ctrlWrapper(updateSubscriptionUsers),
};
