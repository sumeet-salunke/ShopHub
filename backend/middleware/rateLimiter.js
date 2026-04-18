import rateLimit from "express-rate-limit";
//strict limiter for auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  }, standardHeaders: true,
  legacyHeaders: true,
});