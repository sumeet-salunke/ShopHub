import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  //reference to user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  //token type
  type: {
    type: String,
    enum: ["verify", "reset", "refresh", "order"],
    required: true,
  },
  //expiry time
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  ipAddress: String,
  userAgent: String,
  referenceId: mongoose.Schema.Types.ObjectId, // For order tokens, this will reference the order ID

}, { timestamps: true });


export default mongoose.model("Token", tokenSchema);
