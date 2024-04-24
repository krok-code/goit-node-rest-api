import Contact from '../models/Contact.js';

export const listContacts = (filter = {}, query = {}) =>
  Contact.find(filter, '-createdAt -updatedAt', query).populate(
    'owner',
    'name email'
  );

// export const getContactById = id => Contact.findById(id);
export const getContact = filter => Contact.findOne(filter);

export const addContact = data => Contact.create(data);

// export const updateContact = (id, data) => Contact.findByIdAndUpdate(id, data);
export const updateContact = (filter, data) =>
  Contact.findOneAndUpdate(filter, data);

// export const removeContact = id => Contact.findByIdAndDelete(id);
export const removeContact = filter => Contact.findOneAndDelete(filter);

// export const updateStatusContact = (id, data) =>
//   Contact.findByIdAndUpdate(id, data);
export const updateStatusContact = (filter, data) =>
  Contact.findOneAndUpdate(filter, data);
