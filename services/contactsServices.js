import Contact from '../models/Contact.js';

export const listContacts = () => Contact.find({}, '-createdAt -updatedAt');

export const getContactById = id => Contact.findById(id);

export const addContact = data => Contact.create(data);

export const updateContact = (id, data) => Contact.findByIdAndUpdate(id, data);

export const removeContact = id => Contact.findByIdAndDelete(id);

export const updateStatusContact = (id, data) =>
  Contact.findByIdAndUpdate(id, data);
