import { createProductService, getProductsService, updateProductService, deleteProductService } from "../services/productService.js";

export const createProductController = async (req, res, next) => {
  try {
    //1. Extract input
    const data = req.body;
    const user = req.user;
    //2. call service
    const product = await createProductService(data, user);
    //3. send success response
    return res.status(201).json({
      success: true,
      data: product,
    });

  } catch (error) {
    return next(error)
  }
};

export const getProductsController = async (req, res, next) => {
  try {
    const query = req.query;
    const result = await getProductsService(query);
    return res.status(200).json({
      success: true,
      ...result,
    })
  } catch (error) {
    return next(error);
  }
};

export const updateProductController = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const data = req.body;
    const user = req.user;
    const updatedProduct = await updateProductService(productId, data, user);
    return res.status(200).json({
      success: true,
      data: updatedProduct,
    });


  } catch (error) {
    return next(error);
  }
};

export const deleteProductController = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const user = req.user;
    const result = await deleteProductService(productId, user);
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: result,
    })

  } catch (error) {
    return next(error);
  }
}