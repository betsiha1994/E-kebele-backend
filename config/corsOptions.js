const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
  "https://e-kebele-theta.vercel.app",
  "https://e-kebele-q7xwwy3xn-yayehasres1221-9605s-projects.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // ❗ DO NOT throw error — just deny
      callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

module.exports = cors(corsOptions);
