require("dotenv").config();
const bcrypt = require("bcrypt"); // FIXED
const User = require("./models/User"); // FIXED

(async () => {
  try {
    const hashed = await bcrypt.hash("123456", 10);

    await User.create({
      name: "asres yayu",
      email: "asru@gmail.com",
      role: "admin",
      password: hashed,
    });

    console.log("✔ Admin created successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
})();
