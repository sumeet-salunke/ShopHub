import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { placeOrderController, getAllOrdersController, getUserOrdersController, confirmOrderController, cancelOrderController } from "../controllers/orderController.js";
const router = express.Router();

router.post("/orders", authMiddleware, placeOrderController);
router.get("/orders/all", authMiddleware, roleMiddleware("admin"), getAllOrdersController);
router.get("/orders", authMiddleware, getUserOrdersController);
router.get("/orders/confirm/:token", confirmOrderController);
router.patch("/orders/:id/cancel", authMiddleware, cancelOrderController);

export default router;