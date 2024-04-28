import Jimp from "jimp";

import path from "path";

import fs from "fs/promises";

import HttpError from "../helpers/HttpError.js";

import ctrlWrapper from "../decorators/ctrlWrapper.js";

import * as contactsService from "../services/contactsServices.js";

import User from "../models/User.js";

const avatarsPath = path.join("public", "avatars");

export const getAllContacts = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 20, favorite } = req.query;
  const skip = (page - 1) * limit;

  const filter = favorite ? { $and: [{ owner }, { favorite }] } : { owner };
  const contacts = await contactsService.listContacts(filter, { skip, limit });

  if (!contacts) throw HttpError(404);
  res.json(contacts);
};

export const getOneContact = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;
  const contact = await contactsService.getContactById({ _id: id, owner });
  if (!contact) throw HttpError(404);
  res.json(contact);
};

export const deleteContact = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;
  const result = await contactsService.removeContact({ _id: id, owner });
  if (!result) throw HttpError(404);
  res.json(result);
};

export const createContact = async (req, res) => {
  const { _id: owner } = req.user;
  const { name, email, phone } = req.body;

  const existingContact = await contactsService.getContactByDetails({
    name,
    email,
    phone,
    owner,
  });

  if (existingContact) {
    return res.status(400).json({ message: "Contact already exists" });
  }

  let avatar;
  if (req.file) {
    const { path: oldPath, filename } = req.file;
    const newPath = path.join(avatarsPath, filename);
    await fs.rename(oldPath, newPath);
    avatar = path.join("avatars", filename);
  }

  const newContactData = { ...req.body, owner };
  if (avatar) {
    newContactData.avatar = avatar;
  }

  const newContact = await contactsService.addContact(newContactData);
  if (!newContact) {
    throw HttpError(400);
  }

  res.status(201).json(newContact);
};

export const updateContact = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;
  const updatedContact = await contactsService.updateById(
    { _id: id, owner },
    req.body,
    {
      new: true,
    }
  );
  if (!updatedContact) {
    throw HttpError(404);
  }
  res.status(200).json(updatedContact);
};

export const updateStatusContact = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;
  const favoredContact = await contactsService.updateStatusById(
    { _id: id, owner },
    req.body,
    {
      new: true,
    }
  );
  if (!favoredContact) {
    throw HttpError(404, `contact ${id} Not found`);
  }
  res.status(200).json(favoredContact);
};

export const updateAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const { _id } = req.user;
  const { path: tmpUpload, originalname } = req.file;
  const img = await Jimp.read(tmpUpload);
  await img
    .autocrop()
    .cover(250, 250, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
    .writeAsync(tmpUpload);

  const filename = `${Date.now()}-${originalname}`;
  const resultUpload = path.join(avatarsPath, filename);
  await fs.rename(tmpUpload, resultUpload);
  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });

  res.status(200).json({ avatarURL });
};

export const ctrl = {
  getAllContacts: ctrlWrapper(getAllContacts),
  getOneContact: ctrlWrapper(getOneContact),
  deleteContact: ctrlWrapper(deleteContact),
  createContact: ctrlWrapper(createContact),
  updateContact: ctrlWrapper(updateContact),
  updateAvatar: ctrlWrapper(updateAvatar),
  updateStatusContact: ctrlWrapper(updateStatusContact),
};
