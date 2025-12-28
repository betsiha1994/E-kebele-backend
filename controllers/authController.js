const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Op } = require("sequelize");
const userService = require("../services/userService");
const sendEmail = require("../utils/sendEmail");

/* ---------------- LOGIN (UNCHANGED) ---------------- */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    if (user.provider !== "local") {
      return res.status(400).json({
        error:
          "This account uses Google or Apple sign-in. Please use that option.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
}

/* ---------------- FORGOT PASSWORD ---------------- */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const user = await userService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.provider !== "local") {
      return res.status(400).json({
        error:
          "This account was created using Google or Apple sign-in. Please use that option to log in.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await user.update({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: new Date(Date.now() + 15 * 60 * 1000), // 15 min
    });

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      "Password Reset - e-Kebele System",
      `Dear ${user.name},\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link expires in 15 minutes.`
    );

    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Forgot password failed" });
  }
}

/* ---------------- RESET PASSWORD ---------------- */
async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await userService.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { [Op.gt]: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "Token invalid or expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpire: null,
    });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Reset password failed" });
  }
}

module.exports = {
  login,
  forgotPassword,
  resetPassword,
};
