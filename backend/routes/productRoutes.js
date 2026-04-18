import express from "express";
import { createProductController, getProductsController, updateProductController, deleteProductController } from "../controllers/productController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/products", authMiddleware, roleMiddleware("admin"), createProductController);
router.get("/products", getProductsController);
router.patch("/products/:id", authMiddleware, roleMiddleware("admin"), updateProductController);
router.delete("/products/:id", authMiddleware, roleMiddleware("admin"), deleteProductController);

export default router;