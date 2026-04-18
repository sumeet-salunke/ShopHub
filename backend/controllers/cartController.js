import { addToCartService, getCartService, updateCartService, removeFromCartService } from "../services/cartService.js";

export const addToCartController = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;
    const cart = await addToCartService(productId, quantity, userId);
    return res.status(201).json({
      success: true,
      message: "Item added to cart",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

export const getCartController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cart = await getCartService(userId);
    return res.status(200).json({
      success: true,
      data: cart,
    });

  } catch (error) {
    return next(error);
  }
};

export const updateCartController = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const { quantity } = req.body;
    const user = req.user.id;//according to middleware
    const cart = await updateCartService(productId, quantity, user);
    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: cart,
    });

  } catch (error) {
    return next(error);
  }
};

export const removeFromCartController = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const user = req.user.id;
    const cart = await removeFromCartService(productId, user);
    return res.status(200).json({
      success: true,
      message: "Item removed successfully",
      data: cart,
    });

  } catch (error) {
    return next(error);
  }
};