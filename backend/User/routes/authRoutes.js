import express from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";

const router = express.Router();

const otpStore = new Map();

/* =========================
   NODEMAILER SETUP (FIXED)
========================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

/* =========================
   SEND OTP
========================= */

router.post("/send-otp", async (req, res) => {
  try {
    const { email, phonenum } = req.body;

    if (!email || !phonenum) {
      return res
        .status(400)
        .json({ message: "Email and phone number are required." });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }

    if (!/^\d{10}$/.test(phonenum)) {
      return res
        .status(400)
        .json({ message: "Enter a valid 10-digit phone number." });
    }

    await User.findOneAndUpdate(
      { email },
      { email, phonenum },
      { upsert: true, new: true }
    );

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000;

    otpStore.set(email, { otp, expiry });

    await transporter.sendMail({
      from: `"Hekto Shop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Hekto Login OTP",
      html: `
        <div style="font-family:sans-serif;max-width:420px;margin:auto;
                    padding:30px;border:1px solid #eee;border-radius:10px">
          <h2 style="color:#7E33E0">Hekto — Login OTP</h2>
          <p>Your one-time password is:</p>
          <h1 style="letter-spacing:8px;color:#FB2E86">${otp}</h1>
          <p style="font-size:13px;color:#777">
            Expires in <strong>5 minutes</strong>. Do not share it.
          </p>
        </div>
      `,
    });

    res.json({ message: "OTP sent to your email." });
  } catch (err) {
    console.error("send-otp error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

/* =========================
   VERIFY OTP
========================= */

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const stored = otpStore.get(email);

    if (!stored) {
      return res.status(400).json({
        message: "OTP not found. Please request a new one.",
      });
    }

    if (Date.now() > stored.expiry) {
      otpStore.delete(email);
      return res.status(400).json({
        message: "OTP expired. Please request a new one.",
      });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP. Please try again.",
      });
    }

    otpStore.delete(email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // ✅ Create JWT Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const isProduction = process.env.NODE_ENV === "production";

    // ✅ Proper cookie config (localhost + production safe)
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,                        // HTTPS only in production
      sameSite: isProduction ? "None" : "Lax",    // 🔥 FIXED
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      message: "Login Successful",
      user: {
        id: user._id,
        email: user.email,
        phonenum: user.phonenum,
      },
    });
  } catch (err) {
    console.error("verify-otp error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

/* =========================
   LOGOUT
========================= */

router.post("/logout", (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
  });

  res.json({ message: "Logged out successfully." });
});

export default router;