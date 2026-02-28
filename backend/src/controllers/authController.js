const User = require("../models/User.js");
const generateToken = require("../utils/generateToken.js");

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();
  
  //Check if user already exists
  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  //Create user
  const user = await User.create({
    name,
    email: normalizedEmail,
    password, // bcrypt pre-save hook hashes this
  });

  //Return user data + token
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: normalizedEmail,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  const user = await User.findOne({ email:normalizedEmail });
  
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: normalizedEmail,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

module.exports = { registerUser, loginUser };
