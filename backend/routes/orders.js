const express = require("express");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect, adminOnly } = require("../middleware/auth");
const router = express.Router();

// Place order from cart
router.post("/", protect, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = "cod" } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ success: false, message: "Cart is empty" });

    const items = cart.items.map(i => ({
      product: i.product._id,
      name: i.product.name,
      price: i.price,
      quantity: i.quantity,
    }));

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount: cart.totalAmount,
      shippingAddress,
      paymentMethod,
    });

    // Clear cart after order
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], totalAmount: 0 });
    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get my orders
router.get("/my", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all orders (admin)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort("-createdAt");
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update order status (admin)
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
