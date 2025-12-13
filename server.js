const express = require("express");
const dotenv = require("dotenv");
const corsMiddleware = require("./config/corsOptions");

dotenv.config();

const path = require("path");
const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(corsMiddleware);
app.use(express.json());

const sequelize = require("./db");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const requestRoutes = require("./routes/requestRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const documentRoutes = require("./routes/documentRoutes");

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/documents", documentRoutes);

const PORT = process.env.PORT || 3000;

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synced successfully!");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to sync database:", err);
  });
