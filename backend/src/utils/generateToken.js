const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign(
    { id },                 // payload
    process.env.JWT_SECRET, // secret key
    { expiresIn: "30d" }    // expiration
  );
};

module.exports = generateToken;
