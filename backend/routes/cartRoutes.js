import express from "express";
import { addToCartController, getCartController, updateCartController, removeFromCartController } from "../controllers/cartController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/cart", authMiddleware, addToCartController);
router.get("/cart", authMiddleware, getCartController);
router.patch("/cart/:productId", authMiddleware, updateCartController);
router.delete("/cart/:productId", authMiddleware, removeFromCartController);
export default router;