//1. import dependencies

import express from "express";
import helmet from "helmet";
import cors from "cors";
import { corsOptions } from "./config/corsConfig.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";

//2. import routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// 3 import error middleware
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import { globalLimiter } from "./middleware/globalLimiter.js";

//4 create express app
const app = express();
app.set("trust proxy", 1);
app.disable("etag");
//5. security middleware
app.use(helmet({
  crossOriginResourcePolicy: {
    policy: "cross-origin"
  },
}));

//6. enable cors
app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
//global limiter
app.use(globalLimiter);
//7. body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//8.cookie parser
app.use(cookieParser());
//9.logger
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/images", express.static(path.join(process.cwd(), "images")));
//10. routes
app.use("/api/auth", authRoutes);
app.use("/api", productRoutes);
app.use("/api/auth", cartRoutes);
app.use("/api", orderRoutes);


//11. 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  })
});
//12. error middleware
app.use(errorMiddleware);
//13. export app
export default app;
