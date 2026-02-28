const express = require('express');
const { loginUser } = require('../controllers/authController');
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();
const { registerUser } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get("/me", protect, (req, res) => {
  res.json(req.user); // req.user is set by protect middleware
});

module.exports = router;