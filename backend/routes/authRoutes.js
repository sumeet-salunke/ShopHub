import express from "express";
import User from "../models/User.js";
import {
  registerUser, verifyEmail, loginUser, refreshTokenController, logoutUser,
  forgotPassword, resetPasswordForm, resetPassword, deleteAccountController
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", authLimiter, registerUser);
router.get("/verify-email", verifyEmail);
router.post("/login", authLimiter, loginUser);
router.post("/refresh-token", refreshTokenController);
router.post("/logout", logoutUser);
router.post("/forgot-password", authLimiter, forgotPassword);
router.get("/reset-password", resetPasswordForm);
router.post("/reset-password", authLimiter, resetPassword);
router.delete("/users/me", authMiddleware, deleteAccountController);
router.post("/users/me", authMiddleware, deleteAccountController);

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email role");
    res.json({
      message: "Protected route hit",
      user: user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching profile" });
  }
});
router.get("/admin", authMiddleware, roleMiddleware("admin"), (req, res) => {
  res.json({
    message: "admin route",
  });
});

export default router;
