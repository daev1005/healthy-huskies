const User = require("../models/User.js");
const generateToken = require("../utils/generateToken.js");
const crypto = require("crypto");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  if (!name || !normalizedEmail || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required" });
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return res.status(400).json({ message: "Please enter a valid email address" });
  }

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

  const user = await User.findOne({ email: normalizedEmail });

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

// @desc    Send forgot-password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  if (!normalizedEmail) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await User.findOne({ email: normalizedEmail });
  const genericMessage =
    "If that email exists, reset instructions have been sent.";

  // Prevent email enumeration: always return the same message.
  if (!user) {
    return res.json({ message: genericMessage });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = hashedResetToken;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendBaseUrl}/reset-password?token=${resetToken}`;

  // In production, replace this with an email provider integration.
  console.log(`[auth] Password reset link for ${normalizedEmail}: ${resetUrl}`);

  return res.json({
    message: genericMessage,
    ...(process.env.NODE_ENV === "production" ? {} : { resetUrl }),
  });
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Token and password are required" });
  }

  const hashedResetToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedResetToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Reset token is invalid or expired" });
  }

  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  return res.json({ message: "Password has been reset successfully" });
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword };