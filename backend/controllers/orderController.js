import { placeOrderService, getAllOrdersService, getUserOrdersService, confirmOrderService, cancelOrderService } from "../services/orderService.js";
import { getOrderSuccessHTML, getOrderErrorHTML } from "../utils/htmlTemplates.js";

export const placeOrderController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const order = await placeOrderService(userId);
    return res.status(201).json({
      success: true,
      message: "Order placed. Please Confirm via email",
      data: order,
    });

  } catch (error) {
    return next(error);
  }
};

export const getUserOrdersController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit } = req.query;

    const result = await getUserOrdersService(userId, page, limit);

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      ...result,
    });

  } catch (error) {
    return next(error);
  }
};

export const getAllOrdersController = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await getAllOrdersService(page, limit);
    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      ...result,
    });

  } catch (error) {
    return next(error);
  }
};
export const confirmOrderController = async (req, res, next) => {
  try {
    const token = req.params.token;

    const order = await confirmOrderService(token);

    return res.status(200).send(getOrderSuccessHTML());

  } catch (error) {
    return res.status(error.status || 500).send(getOrderErrorHTML(error.message));
  }
};

export const cancelOrderController = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const user = req.user;
    const order = await cancelOrderService(orderId, user);
    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });

  } catch (error) {
    return next(error);
  }
}