const adminOnly = (req, res, next) => {
  // protect must have run already, so req.user should exist
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Forbidden: admin only" });
};

module.exports = { adminOnly };