const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    status: { type: String, enum: ["pending","confirmed","shipped","delivered","cancelled"], default: "pending" },
    paymentMethod: { type: String, enum: ["cod","card","upi"], default: "cod" },
    paymentStatus: { type: String, enum: ["unpaid","paid","refunded"], default: "unpaid" },
    statusHistory: [{ status: String, updatedAt: { type: Date, default: Date.now }, note: String }],
  },
  { timestamps: true }
);

orderSchema.pre("save", async function () {
  if (this.isModified("status")) {
    this.statusHistory.push({ status: this.status });
  }
});

module.exports = mongoose.model("Order", orderSchema);
