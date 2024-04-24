import { Schema, model } from 'mongoose';

import { handleSaveError, setUpdateSettings } from './hooks.js';

import { emailRegexp } from '../constants/auth-constants.js';

const userSchema = new Schema(
  {
    password: {
      type: String,
      minlength: 6,
      required: [true, 'Password is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: emailRegexp,
    },
    subscription: {
      type: String,
      enum: ['starter', 'pro', 'business'],
      default: 'starter',
    },
    token: {
      type: String,
      default: null,
    },
    avatarURL: {
      type: String,
      // required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post('save', handleSaveError);

userSchema.pre('findOneAndUpdate', setUpdateSettings);

userSchema.post('findOneAndUpdate', handleSaveError);

const User = model('user', userSchema);

export default User;
