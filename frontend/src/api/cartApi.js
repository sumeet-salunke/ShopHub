import { privateApi } from "./client.js";

export const getCart = () => privateApi.get("/auth/cart");
export const addToCart = (data) => privateApi.post("/auth/cart", data);
export const updateCart = (data) => privateApi.patch(`/auth/cart/${data.productId}`, data);
export const removeCart = (id) => privateApi.delete(`/auth/cart/${id}`);
