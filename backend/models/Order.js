import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: {
    type: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: { type: String, required: true },
        price: { type: Number, required: true, min: [1, "price must be positive"] },
        quantity: { type: Number, required: true, min: [1, "Quantity must be at least 1"] },
      },
    ],
    default: [],
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, "Total amount cannot be negative"],
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "delivered", "cancelled"],
    default: "pending",
  },

}, { timestamps: true });
orderSchema.index({ userId: 1 });

export default mongoose.model("Order", orderSchema);

