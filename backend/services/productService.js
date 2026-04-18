
import mongoose from "mongoose";
import Product from "../models/Product.js";

export const createProductService = async (data, user) => {
   //1. input check
   if (!data) {
      throw { message: "Invalid input", status: 400 };
   }
   let { name, price, stock, category, description, images } = data;
   //2.authorization safety
   if (user.role !== "admin") {
      throw { message: "Not allowed to create Product", status: 403 };
   }
   //3. validation
   if (!name || name.trim().length < 3) {
      throw { message: "Invalid name", status: 400 };
   }
   price = Number(price);
   if (isNaN(price) || price <= 0) {
      throw { message: "Invalid price", status: 400 };
   }
   stock = Number(stock);
   if (!Number.isInteger(stock) || stock < 0) {
      throw { message: "Inavlid stock", status: 400 };
   }
   if (!category) {
      throw { message: "Category required", status: 400 };
   }

   //4. sanitization
   name = name.trim().toLowerCase();
   category = category.trim();
   if (description) {
      description = description.trim();
   }
   //5 business validation
   //check if product with same name exists
   const sameProductExists = await Product.findOne({ name });
   if (sameProductExists) {
      throw { message: "Product already exists", status: 400 };
   }
   //6. create product object
   const newProduct = await Product.create({
      name, price, stock, category, description, images, createdBy: user.id
   });
   //7.response
   return newProduct;

};

export const getProductsService = async (query) => {
   //1. extract query params
   let page = Number(query.page) || 1;
   let limit = Number(query.limit) || 10;

   if (page < 1) page = 1;
   if (limit > 50) limit = 50;

   //2. calculate skip
   const skip = (page - 1) * limit;

   //3. build filter object
   const filter = { isActive: true };

   if (query.category) {
      filter.category = query.category.trim();
   }

   const minPrice = Number(query.minPrice);
   const maxPrice = Number(query.maxPrice);
   if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      filter.price = {};
      if (!isNaN(minPrice)) {
         filter.price.$gte = minPrice;
      }
      if (!isNaN(maxPrice)) {
         filter.price.$lte = maxPrice;
      }
   }
   console.log("Filter:", filter);
   //4.fetch products
   const products = await Product.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
   //5.count total products
   const total = await Product.countDocuments(filter);
   //6. return response
   return {
      products, total, page, totalPages: Math.ceil(total / limit),
   };

};
export const updateProductService = async (productId, data, user) => {
   //1. authorization
   if (user.role !== "admin") {
      throw { message: "Not authorized to update product", status: 403 };
   }
   //2.validate productId
   if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw { message: "Invalid product ID", status: 400 };
   }
   //3. check empty update
   if (!data || Object.keys(data).length === 0) {
      throw { message: "No data provided for update", status: 400 };
   }
   //4.find product
   const product = await Product.findById(productId);
   if (!product) {
      throw { message: "Product not found", status: 404 };
   }
   //5. validate input(only provided fields) and update
   //name
   if (data.name !== undefined) {
      if (typeof data.name !== "string") {
         throw { message: "Invalid name", status: 400 };
      }
      const name = data.name.trim().toLowerCase();
      if (name.length < 3) {
         throw { message: "Invalid name", status: 400 };
      }
      // UNIQUE CHECK
      const existing = await Product.findOne({ name });
      if (existing && existing._id.toString() !== productId) {
         throw { message: "Product name already exists", status: 400 };
      }
      product.name = name;
   }

   //price
   if (data.price !== undefined) {
      const price = Number(data.price);
      if (isNaN(price) || price <= 0) {
         throw { message: "Invalid price", status: 400 };
      }
      product.price = price;
   }
   //stock
   if (data.stock !== undefined) {
      const stock = Number(data.stock);
      if (!Number.isInteger(stock) || stock < 0) {
         throw { message: "Invalid stock", status: 400 };
      }
      product.stock = stock;
   }
   //category
   if (data.category !== undefined) {
      if (typeof data.category !== "string" || !data.category.trim()) {
         throw { message: "Invalid category", status: 400 };
      }
      product.category = data.category.trim();
   }
   //description
   if (data.description !== undefined) {
      if (typeof data.description !== "string") {
         throw { message: "Invalid description", status: 400 };
      }
      product.description = data.description.trim();
   }
   //images
   if (data.images !== undefined) {
      if (!Array.isArray(data.images) || !data.images.every((img) => typeof img === "string")) {
         throw { message: "Images must be an array of strings", status: 400 };
      }
      product.images = data.images;
   }
   //isActive(optional admin controller)
   if (data.isActive !== undefined) {
      product.isActive = Boolean(data.isActive);
   }
   //6.save
   const updatedProduct = await product.save();
   //7. return updated product
   return updatedProduct;
};


export const deleteProductService = async (productId, user) => {
   //1.authorization
   if (user.role !== "admin") {
      throw { message: "Not authorized to delete product", status: 403 };
   }
   //2.validate productId
   if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw { message: "Invalid product ID", status: 400 };
   }
   //3. find product
   const product = await Product.findById(productId);
   if (!product) {
      throw { message: "Product not found", status: 404 };
   }
   //4. check already deleted?
   if (!product.isActive) {
      throw { message: "Product already deleted", status: 400 };
   }
   //5. soft delete
   product.isActive = false;
   await product.save();
   //6.return 
   return product;
};
