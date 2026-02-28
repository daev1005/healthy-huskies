// Turns Mongoose ValidationError into a clean { field: message } map
function formatMongooseValidationError(err) {
  const errors = {};
  for (const key in err.errors) {
    errors[key] = err.errors[key].message;
  }
  return errors;
}

module.exports = { formatMongooseValidationError };