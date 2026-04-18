//import all dependencies
import { handleRegister, handleEmailVerification, handleLogin, handleRefreshToken, handleLogout, handleForgotPassword, handleResetPassword, handleDeleteAccount } from "../services/authService.js";
import { getErrorHTML, getSuccessHTML } from "../utils/htmlTemplates.js";

const escapeHTML = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const registerUser = async (req, res, next) => {
  try {
    // call service
    const result = await handleRegister(req.body);
    //send response
    return res.status(201).json({
      message: "User registered. Please verify your email",
      data: result,
    });

  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    await handleEmailVerification(token);
    return res.status(200).send(getSuccessHTML());

  } catch (error) {
    return res.status(error.status || 500)
      .send(getErrorHTML(error.message));
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    //1. call service properly
    const { accessToken, refreshToken } = await handleLogin({ email, password }, req);

    const isProd = process.env.NODE_ENV === "production";

    //2. set refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,//7 days
    });
    //send success token
    return res.status(200).json({
      success: true,
      accessToken,
    });

  } catch (error) {
    next(error);
  }
};

export const refreshTokenController = async (req, res, next) => {
  try {
    //1.get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw { message: "Unauthorized", status: 401 };
    }
    //2.call service 
    const { accessToken, refreshToken: newRefreshToken } = await handleRefreshToken(refreshToken, req);
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    //3. return new access token
    return res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    next(error);
  }

};

export const logoutUser = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    //1. call service
    await handleLogout(refreshToken);
    const isProd = process.env.NODE_ENV === "production";
    //2. clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });
    //3. send response
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    //1. validate input
    if (!email) {
      throw { message: "Email required", status: 400 };
    }
    //2. call service
    const result = await handleForgotPassword(email);
    //3. return response
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordForm = async (req, res) => {
  const token = escapeHTML(req.query.token);

  if (!token) {
    return res.status(400).send("Reset token is required");
  }

  return res.status(200).send(`
    <form method="POST" action="/api/auth/reset-password">
      <input type="hidden" name="token" value="${token}" />
      <label>
        New password
        <input type="password" name="newPassword" minlength="6" required />
      </label>
      <button type="submit">Reset password</button>
    </form>
  `);
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    //1. validate input
    if (!token || !newPassword) {
      throw { message: "Token and new password are required", status: 400 };
    }
    if (newPassword.length < 6) {
      throw { message: "Password must be at least 6 characters", status: 400 };
    }
    //2. call service
    const result = await handleResetPassword(token, newPassword);
    //3.response
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccountController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await handleDeleteAccount(userId);
    //clear cookie
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });
    res.status(200).json({
      success: true,
      message: "Account deleted Successfully",
    });
  } catch (error) {
    return next(error);
  }
};
