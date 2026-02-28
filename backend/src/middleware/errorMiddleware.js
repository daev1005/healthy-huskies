const { formatMongooseValidationError } = require("../utils/formatMongooseValidationError");

const errorHandler = (err, req, res, next) => {
  // Mongoose bad ObjectId (e.g., /meals/notAnId)
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid id" });
  }

  // Mongoose schema validation failed (min, required, etc.)
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: formatMongooseValidationError(err),
    });
  }

  // Mongo duplicate key (unique index) e.g. email already exists
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    const field = fields[0] || "field";
    return res.status(400).json({ message: `${field} already exists` });
  }

  console.error(err);
  return res.status(500).json({ message: "Server error" });
};

module.exports = { errorHandler };