import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const formatCart = async (cart) => {
  if (!cart) {
    return {
      items: [],
      totalItems: 0,
    };
  }

  await cart.populate({
    path: "items.productId",
    select: "name price stock images isActive",
  });

  const items = cart.items
    .filter((item) => item.productId && item.productId.isActive !== false)
    .map((item) => ({
      _id: item._id,
      productId: item.productId,
      quantity: item.quantity,
    }));

  return {
    items,
    totalItems: items.length,
  };
};
export const addToCartService = async (productId, quantity, userId) => {
  console.log("user", userId);
  //validate quantity
  quantity = Number(quantity);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw { message: "Invalid quantity", status: 400 };
  }
  //1. check if product exists
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw { message: "Product not found", status: 404 };
  }
  //2. check stock
  if (product.stock < quantity) {
    throw { message: "Out of stock", status: 400 };
  }
  //3. find user's cart
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({
      userId, items: []
    });
  }
  //4.check if product already in cart
  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );
  if (itemIndex != -1) {
    //already exists->increase quantity
    const newQuantity = cart.items[itemIndex].quantity + quantity;
    //recheck stock for updated quantity
    if (newQuantity > product.stock) {
      throw { message: "Exceeds stock available", status: 400 };
    }
    cart.items[itemIndex].quantity = newQuantity;
  } else {
    //not exists
    cart.items.push({
      productId,
      quantity
    });
  }
  //5. save cart
  await cart.save();
  return formatCart(cart);
};
export const getCartService = async (user) => {
  //1. find cart
  const cart = await Cart.findOne({ userId: user });
  //2. if cart does not exists
  if (!cart) {
    return {
      items: [],
      totalItems: 0,
    };
  }
  //3. return cart with populated productId so frontend can render item.productId.name/price/images
  return formatCart(cart);
};
export const updateCartService = async (productId, quantity, user) => {
  //1. validate input
  quantity = Number(quantity);
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw { message: "Invalid quantity", status: 400 };
  }
  //2. find product by productId
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw { message: "Product not found", status: 404 };
  }
  //3. find cart
  const cart = await Cart.findOne({ userId: user });
  if (!cart) {
    throw { message: "Cart not found", status: 404 };
  }
  //4. find item in cart
  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );
  if (itemIndex === -1) {
    throw { message: "Product not in cart", status: 404 };
  }
  //5. handle quantity
  if (quantity === 0) {
    cart.items.splice(itemIndex, 1);
    await cart.save();
    return formatCart(cart);
  }
  //6. stock invalidation
  if (quantity > product.stock) {
    throw { message: "Exceeds stock", status: 400 };
  }
  //7. update quantity
  cart.items[itemIndex].quantity = quantity;
  //8. save
  await cart.save();
  //return updated cart.
  return formatCart(cart);
};
export const removeFromCartService = async (productId, user) => {
  //find cart
  const cart = await Cart.findOne({ userId: user });
  if (!cart) {
    throw { message: "Cart not found", status: 404 };
  }
  //2. finditem
  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId.toString()
  );
  if (itemIndex === -1) {
    throw { message: "Product not in cart", status: 404 };
  }
  //remove item
  cart.items.splice(itemIndex, 1);
  //4. save cart
  await cart.save();
  //5. return updated cart
  return formatCart(cart);

};
