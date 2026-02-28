const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

router.get("/ping", protect, adminOnly, (req, res) => {
  res.json({ message: "admin pong", admin: req.user.email });
});

module.exports = router;
