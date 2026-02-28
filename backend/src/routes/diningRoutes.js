const express = require("express");
const { getDiningPeriods, getDiningMenu } = require("../controllers/diningController");

const router = express.Router();

router.get("/periods", getDiningPeriods);
router.get("/menu", getDiningMenu);

module.exports = router;
