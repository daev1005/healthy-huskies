const express = require("express");
const cors = require("cors");
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/meals", require("./routes/mealRoutes"));
app.use("/api/dining", require("./routes/diningRoutes"));

app.use(errorHandler);

// Test route
app.get("/", (req, res) => res.send("API is running..."));

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

module.exports = app;
