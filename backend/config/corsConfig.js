import cors from "cors";
const getAllowedOrigins = () => {
  return [
    process.env.BASE_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
  ].filter(Boolean); // removes undefined if BASE_URL isn't set yet
};

export const corsOptions = {
  origin(origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma"],
}

export default cors(corsOptions);
