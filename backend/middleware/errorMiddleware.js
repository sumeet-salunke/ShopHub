import logger from "../utils/logger.js";

export const errorMiddleware = (err, req, res, next) => {
  logger.error(err.message);
  const status = err.status || 500;
  const message = err.message || "Server error";

  return res.status(status).json({
    success: false,
    message,
  });
};