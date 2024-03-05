const Product = require('../models/product');
const Cart = require('../models/cart');


exports.getIndex = async (req, res) => {
  const prods = await Product.fetchAll();
  
  res.render('./shop/index', {
    prods,
    pageTitle: 'Shop',
    path: '/',
  });
};

exports.getProducts = async (req, res) => {
  const prods = await Product.fetchAll();
  
  res.render('./shop/products-list', {
    prods,
    pageTitle: 'All Products',
    path: '/products',
  });
};

exports.getCart = async (req, res) => {
  const cart = await Cart.fetchAll();
  const products = await Product.fetchAll();
  
  const cartProducts = [];
  
  for (let productData of products) {
    const cartProductData = cart.products.find(it => it.id === productData.id);
    
    if (cartProductData) {
      cartProducts.push({ productData, qty: cartProductData.qty });
    }
  }
  
  res.render('./shop/cart', {
    pageTitle: 'Your Cart',
    path: '/cart',
    products: cartProducts,
  });
};

exports.postAddToCart = async (req, res) => {
  const { productId } = req.body;
  const { id, price } = await Product.getById(productId);
  
  await Cart.addProduct(id, price);
  res.redirect('/products');
};

exports.postDeleteProductFromCart = async (req, res) => {
  const { productId } = req.body;
  const { price } = Product.getById(productId);
  
  await Cart.deleteProduct(productId, price);
  res.redirect('/cart');
};

exports.getCheckout = (req, res) => {
  res.render('./shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout',
  });
};

exports.getOrders = (req, res) => {
  res.render('./shop/orders', {
    pageTitle: 'Your Orders',
    path: '/orders',
  });
};

exports.getProductDetails = async (req, res) => {
  const { productId } = req.params;
  const product = await Product.getById(productId);
  
  res.render('./shop/product-details', {
    product,
    pageTitle: product.title,
    path: '/products',
  });
};
