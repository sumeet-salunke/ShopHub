import { privateApi } from "./client.js";

export const placeOrder = () => privateApi.post("/orders");
export const getOrders = () => privateApi.get("/orders");

export const cancelOrder = (id) => privateApi.patch(`/orders/${id}/cancel`);
