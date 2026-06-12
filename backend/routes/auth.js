const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.create({ name, email, password, role });
    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user: { id: user._id, name, email, role: user.role } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    const token = signToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email, role: user.role } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get("/me", protect, async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
