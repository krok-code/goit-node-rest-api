import express from 'express';

import authControllers from '../controllers/authControllers.js';

import authenticate from '../midelwares/authenticate.js';

import validateBody from '../helpers/validateBody.js';

import upload from '../midelwares/upload.js';

import {
  userSignupSchema,
  userSigninSchema,
  updateSubscriptionSchema,
} from '../schemas/usersShemas.js';

const authRouter = express.Router();

authRouter.post(
  '/register',
  validateBody(userSignupSchema),
  authControllers.register
);

authRouter.post(
  '/login',
  validateBody(userSigninSchema),
  authControllers.login
);

authRouter.get('/current', authenticate, authControllers.getCurrent);

authRouter.post('/logout', authenticate, authControllers.logout);

authRouter.patch(
  '/',
  authenticate,
  validateBody(updateSubscriptionSchema),
  authControllers.updateSubscriptionUsers
);
authRouter.patch(
  '/avatars',
  authenticate,
  upload.single('avatar'),
  authControllers.updateAvatar
);

export default authRouter;
