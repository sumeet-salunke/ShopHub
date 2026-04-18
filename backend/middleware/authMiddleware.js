import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    //1. get authorization header
    const authHeader = req.headers.authorization;
    //2. check header exists and format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized - no token provided",
      });
    }
    //3. extract token
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json(
        { message: "No token" },
      );
    }
    //4. verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    //5. check that the user still exists and is allowed to use access tokens
    const user = await User.findById(decoded.id).select("role isVerified passwordChangedAt");
    if (!user || !user.isVerified) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
      return res.status(401).json({
        message: "Token expired",
      });
    }

    //6. attach trusted current user data
    req.user = {
      id: user._id,
      role: user.role,
    };
    //7. continue
    next();


  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: "Token expired",
      });
    }
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
};
