const express = require("express");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Import routes
const serviceRoutes = require("./routes/serviceRoutes");
const userRoutes = require("./routes/userRoutes");
// You can add serviceRequestRoutes later
// const serviceRequestRoutes = require("./routes/serviceRequestRoutes");

// Mount routes
app.use("/services", serviceRoutes);
app.use("/users", userRoutes);
// app.use("/users", userRoutes);
// app.use("/requests", serviceRequestRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
