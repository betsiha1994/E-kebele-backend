const express = require("express");
const dotenv = require("dotenv");
const corsMiddleware = require("./config/corsOptions");

dotenv.config();

const path = require("path");
const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/certificates", express.static(path.join(__dirname, "certificates")));

app.use(corsMiddleware);
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("E-Kebele backend is running");
});

const sequelize = require("./db");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const requestRoutes = require("./routes/requestRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const documentRoutes = require("./routes/documentRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
// const certificateRoutes = require('./routes/certificateRoutes');

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api", certificateRoutes);

// const PORT = process.env.PORT || 3000;

// sequelize
//   .sync({ alter: true })
//   .then(() => {
//     console.log("Database synced successfully!");
//     app.listen(PORT, () => {
//       console.log(`Server running at http://localhost:${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("Failed to sync database:", err);
//   });
const PORT = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);

    // IMPORTANT: still start the server so Render does not fail
    app.listen(PORT, () => {
      console.log("Server started WITHOUT DB connection");
    });
  });
