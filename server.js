const express = require("express");
const dotenv = require("dotenv");
const corsMiddleware = require("./config/corsOptions");
// Load environment variables
dotenv.config();
const path = require("path");
const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(corsMiddleware);
app.use(express.json());

// Import routes
const serviceRoutes = require("./routes/serviceRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

// You can add serviceRequestRoutes later
// const serviceRequestRoutes = require("./routes/serviceRequestRoutes");

// Mount routes
app.use("/api/services", serviceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// app.use("/users", userRoutes);
// app.use("/requests", serviceRequestRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
