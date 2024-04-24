export const handleSaveError = (error, data, next) => {
  const { name, code } = error;
  const status = name === 'MongoServerError' && code === 11000 ? 409 : 400;
  error.status = status;
  next();
};

export const setUpdateSettings = function (next) {
  this.options.new = true;
  this.options.runValidators = true;
  next();
};
