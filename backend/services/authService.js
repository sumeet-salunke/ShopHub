import User from "../models/User.js";
import Token from "../models/Token.js";
import Cart from "../models/Cart.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import logger from "../utils/logger.js";
import { getVerifyEmailTemplate } from "../utils/emailTemplate.js";

const ACCOUNT_LOCK_TIME_MS = 15 * 60 * 1000;

const ensureTokenValue = (token, type) => {
  if (!token) {
    throw { message: `Cannot create ${type} token without a token value`, status: 500 };
  }
};

export const handleRegister = async ({ name, email, password }) => {
  //1. validate input
  if (!name || !email || !password) {
    throw { message: "All fields are required", status: 400 };
  }
  email = email.toLowerCase().trim();
  name = name.trim();
  //2. check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw { message: "User already exists. Instead Login", status: 400 };
  }
  //3.create user
  const user = await User.create({
    name, email, password
  });
  //delete old tokens
  await Token.deleteMany({
    userId: user._id, type: "verify",
  });

  //4.generate verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  //hash verification token
  const hashedToken = crypto.createHash("sha256")
    .update(verificationToken).digest("hex");

  ensureTokenValue(hashedToken, "verification");
  //5. save token to DB
  await Token.create({
    userId: user._id,
    token: hashedToken,
    type: "verify",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  //6. create verification link
  const baseUrl = (() => {
    const envUrl = process.env.BASE_URL?.trim();
    if (envUrl && /^https?:\/\//i.test(envUrl)) {
      return envUrl.replace(/\/+$/, "");
    }
    return "https://shophub-backend-nble.onrender.com";
  })();
  const verificationLink = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;
  //7. send verification link
  await sendEmail({
    to: user.email,
    subject: "Verify your email",
    html: getVerifyEmailTemplate(verificationLink, user.name),
  });
  logger.info(`New user registered: ${email}`);
  return {
    email: user.email,
  };

};

export const handleEmailVerification = async (token) => {
  if (!token) {
    throw { message: "Token is required", status: 400 };
  }
  //hash incoming token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  //1.find token
  const tokenDoc = await Token.findOne({
    token: hashedToken, type: "verify"
  });
  if (!tokenDoc) {
    throw { message: "Invalid token", status: 400 };
  }
  //2.check expiry
  if (tokenDoc.expiresAt.getTime() < Date.now()) {
    throw { message: "Token expired", status: 410 };
  }
  //3. find user
  const user = await User.findById(tokenDoc.userId);
  if (!user) {
    throw { message: "User not found", status: 404 };

  }
  //prevent re-verification
  if (user.isVerified) {
    throw { message: "Email already verified", status: 400 };
  }
  //4. mark verified
  user.isVerified = true;
  await user.save();
  //5. delete all token
  await Token.deleteMany({
    userId: user._id, type: "verify",
  });
  return {
    email: user.email,
  };
};

export const handleLogin = async ({ email, password }, req) => {
  //1. validate input
  if (!email || !password) {
    throw { message: "All fields are required", status: 400 };
  }
  email = email.toLowerCase().trim();
  //2. find user
  const user = await User.findOne({ email });
  if (!user) {
    throw { message: "Invalid credentials", status: 401 };
  }
  //3. email verification check
  if (!user.isVerified) {
    throw { message: "Please verify email first.", status: 403 };
  }
  //4.check account lock
  if (user.accountLockedUntil) {
    const now = new Date();
    const lockedUntil = new Date(user.accountLockedUntil);
    const lockMsRemaining = lockedUntil.getTime() - now.getTime();

    if (lockMsRemaining > 0 && lockMsRemaining <= ACCOUNT_LOCK_TIME_MS) {
      throw { message: "Account locked. Try later", status: 423 };
    }

    // Clear expired or invalid stale lock state before checking the password.
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = undefined;
    await user.save();
  }
  //5. compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const lockUntil = new Date(Date.now() + ACCOUNT_LOCK_TIME_MS);

    await User.findByIdAndUpdate(
      user._id,
      [
        {
          $set: {
            failedLoginAttempts: {
              $add: [{ $ifNull: ["$failedLoginAttempts", 0] }, 1],
            },
          },
        },
        {
          $set: {
            accountLockedUntil: {
              $cond: [
                { $gte: ["$failedLoginAttempts", 5] },
                lockUntil,
                "$accountLockedUntil",
              ],
            },
          },
        },
      ],
      { updatePipeline: true },
    );
    throw { message: "Invalid credentials", status: 401 };
  }
  //6. success->reset
  user.failedLoginAttempts = 0;
  user.accountLockedUntil = undefined;
  await user.save();
  //8.generate token
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  //hash the token
  const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

  ensureTokenValue(hashedRefreshToken, "refresh");
  await Token.create({
    userId: user._id,
    token: hashedRefreshToken,
    type: "refresh",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
  });
  return { accessToken, refreshToken };
};

export const handleRefreshToken = async (refreshToken, req) => {
  //1. check if token exists
  if (!refreshToken) {
    throw { message: "Unauthorized", status: 401 };
  }
  //2. verify jwt
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw { message: "Unauthorized", status: 401 };
  }
  //hash before DB lookup.
  const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
  //3. Atomically find and delete old refresh token so it cannot be reused.
  const tokenDoc = await Token.findOneAndDelete({
    token: hashedRefreshToken,
    type: "refresh",
    userId: decoded.id,
    expiresAt: { $gt: new Date() },
  });
  //reuse detection
  if (!tokenDoc) {
    await Token.deleteMany({ userId: decoded.id, type: "refresh" });
    throw { message: "Unauthorized - token reuse detected", status: 401 };
  }
  //4. check user
  const user = await User.findById(decoded.id);
  if (!user) {
    throw { message: "Unauthorized", status: 401 };
  }
  //5.optional check password changed after token issued
  if (user.passwordChangedAt && decoded.iat * 1000 < user.passwordChangedAt.getTime()) {
    throw { message: "Token expired. Login again", status: 401 };
  }
  //6. generate new access token
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  //hash newRefresh token
  const newHashedRefreshToken = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
  ensureTokenValue(newHashedRefreshToken, "refresh");
  //store new token 
  await Token.create({
    userId: user._id,
    token: newHashedRefreshToken,
    type: "refresh",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const handleLogout = async (refreshToken) => {
  if (!refreshToken) return true;

  const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex");

  await Token.deleteOne({
    token: hashedRefreshToken,
    type: "refresh",
  });
  return true;
};

export const handleForgotPassword = async (email) => {
  email = email.toLowerCase().trim();
  //1. find user
  const user = await User.findOne({ email });
  if (!user) {
    return { message: "If this email exists, a reset link has been sent" };
  }
  //2. delete old reset token
  await Token.deleteMany({ userId: user._id, type: "reset" });
  //3. generate token
  const rawToken = crypto.randomBytes(32).toString("hex");
  //hashed token store in DB
  const hashedRawToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  ensureTokenValue(hashedRawToken, "reset");
  //4. store token
  await Token.create({
    userId: user._id,
    token: hashedRawToken,
    type: "reset",
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
  });
  // Point link to frontend for React-based password reset
  const resetLink = `http://localhost:5173/reset-password?token=${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: "Reset password",
    html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8; padding: 40px 20px; text-align: center;">
      <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 40px 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);">
        <h2 style="color: #1a365d; font-size: 24px; margin-bottom: 20px;">Password Reset Request</h2>
        <p style="color: #4a5568; font-size: 16px; margin-bottom: 30px; text-align: left; line-height: 1.5;">
          We received a request to reset your password. Click the button below to choose a new password:
        </p>
        <a href="${resetLink}" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff; background-color: #3182ce; text-decoration: none; border-radius: 8px;">Reset Password</a>
        <p style="margin-top: 30px; font-size: 14px; color: #718096;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    </div>
    `,
  });
  logger.info(`Password reset requested for ${email}`);

  //6. return success message
  return { message: "If this email exists, a reset link has been sent" };
};

export const handleResetPassword = async (token, newPassword) => {
  //hash token
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  //1. find token
  const tokenDoc = await Token.findOne({
    token: hashedToken, type: "reset",
  });
  if (!tokenDoc) {
    throw { message: "Invalid or expired token", status: 400 };
  }
  //2. check token expiry
  if (tokenDoc.expiresAt < Date.now()) {
    throw { message: "Token expired", status: 410 };
  }
  //3. find user
  const user = await User.findById(tokenDoc.userId);
  if (!user) {
    throw { message: "User not found", status: 404 };
  }
  //4. update password
  user.password = newPassword;
  user.passwordChangedAt = Date.now();
  await user.save();
  //5.delete reset token
  await Token.deleteMany({ userId: user._id, type: "reset" });
  return { message: "Password reset successfully" };
};

export const handleDeleteAccount = async (userId) => {
  //1.find user
  const user = await User.findById(userId);
  if (!user) {
    throw { message: "User not found", status: 404 };
  }
  const userEmail = user.email;//store before deletion
  //2. delete cart
  await Cart.deleteMany({ userId });
  //3. delete tokens
  await Token.deleteMany({ userId });
  //4. delete user
  await User.findByIdAndDelete(userId);
  //5. send fare well email(after deletion)
  await sendEmail({
    to: user.email,
    subject: "Account deleted",
    html: "Your account has been deleted. Hope you had a great experience. Stay happy 😊",
  });
  return true;
};
