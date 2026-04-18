import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 100,
    trim: true,
    lowercase: true,
  },

  description: {
    type: String, trim: true, maxLength: 500,
  },
  price: {
    type: Number,
    required: true, min: [1, "Price must be greater than 0"],
  },
  stock: {
    type: Number, required: true, min: [0, "Stock cannot be negative"],
    validate: {
      validator: Number.isInteger,
      message: "Stock must be integer",
    }
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  images: [{
    type: String, required: true,
  }]
  ,
  isActive: {
    type: Boolean,
    default: true,

  }, createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
}, { timestamps: true });
productSchema.index({ name: 1 });

export default mongoose.model("Product", productSchema);