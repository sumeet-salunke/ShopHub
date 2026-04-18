import api from "./axios.js";

export const getProducts = (params) =>
  api.get("/products", { params });