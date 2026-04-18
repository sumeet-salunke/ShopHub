
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";
import crypto from "crypto";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import Token from "../models/Token.js";
import { getOrderConfirmationTemplate } from "../utils/emailTemplate.js";

const ensureTokenValue = (token, type) => {
  if (!token) {
    throw { message: `Cannot create ${type} token without a token value`, status: 500 };
  }
};
//using mongoDB transcation
export const placeOrderService = async (userId) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    //get user
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw { message: "User not found", status: 404 };
    }
    //1. get cart
    const cart = await Cart.findOne({ userId })
      .populate("items.productId").session(session);

    if (!cart || cart.items.length === 0) {
      throw { message: "cart is empty", status: 400 };
    }
    let totalAmount = 0;
    const orderItems = [];
    //2. validate items
    for (const item of cart.items) {
      const product = item.productId;
      if (!product || !product.isActive) {
        throw { message: "Product not available", status: 404 };
      }
      if (product.stock < item.quantity) {
        throw { message: `Insufficient stock for ${product.name} `, status: 400 };
      }
      totalAmount += product.price * item.quantity;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
      });
    }

    //3. create order
    const [order] = await Order.create([{
      userId,
      items: orderItems,
      totalAmount,
      status: "pending",
    },
    ], { session }
    );
    //4. reduce stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }, { session }
      );
    }
    //5. clear cart
    cart.items = [];
    await cart.save({ session });

    //6. generate raw token
    const rawToken = crypto.randomBytes(32).toString("hex");
    //7. hash token(security)
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    ensureTokenValue(hashedToken, "order confirmation");

    //8. save token in DB
    await Token.create([
      {
        userId,
        token: hashedToken,
        type: "order",
        referenceId: order._id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    ], { session });
    //9. commit
    await session.commitTransaction();
    //10. send email AFTER commit
    const baseUrl = process.env.BASE_URL || "https://shophub-backend-nble.onrender.com";
    const confirmUrl = `${baseUrl}/api/orders/confirm/${rawToken}`;
    await sendEmail({
      to: user.email,
      subject: "Confirm your order",
      html: getOrderConfirmationTemplate(confirmUrl, user.name, totalAmount.toFixed(2)),
    });

    return order;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getUserOrdersService = async (userId, page = 1, limit = 10) => {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;
  const orders = await Order.find({ userId }).populate("items.productId").sort({ createdAt: -1 }).skip(skip).limit(limitNum);
  const total = await Order.countDocuments({ userId });

  return {
    orders,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

export const getAllOrdersService = async (page = 1, limit = 10) => {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;
  const orders = await Order.find().populate("userId", "name email").sort({ createdAt: -1 }).skip(skip).limit(limitNum);

  const totalOrders = await Order.countDocuments();

  return {
    orders,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  };
};

export const confirmOrderService = async (token) => {
  //1. hash incoming token
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  //2. find token in DB
  const tokenDoc = await Token.findOne({
    token: hashedToken,
    type: "order",
  });

  if (!tokenDoc) {
    throw { message: "Invalid or expired token", status: 400 };
  }

  //3. check expiry
  if (tokenDoc.expiresAt < Date.now()) {
    throw { message: "Token expired", status: 400 };
  }

  //4. find order
  const order = await Order.findById(tokenDoc.referenceId);

  if (!order) {
    throw { message: "Order not found", status: 404 };
  }

  //5. check already confirmed
  if (order.status !== "pending") {
    throw { message: "Order already processed", status: 400 };
  }

  //6. update status
  order.status = "confirmed";
  await order.save();

  //7. delete token (one-time use)
  await Token.deleteOne({ _id: tokenDoc._id });

  return order;
};

export const cancelOrderService = async (orderId, user) => {
  //1. find order
  const order = await Order.findById(orderId);
  if (!order) {
    throw { message: "Order not found", status: 404 };
  }
  //2. check ownership or admin
  if (order.userId.toString() !== user.id.toString() && user.role !== "admin") {
    throw { message: "Not authorized", status: 403 };
  }
  //3. status check
  if (order.status !== "pending") {
    throw {
      message: "Only pending orders can be cancelled",
      status: 400,

    };
  }
  //4. return stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: item.quantity },
    });
  }
  //update status
  order.status = "cancelled";
  await order.save();
  return order;
};