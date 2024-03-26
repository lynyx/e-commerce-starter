const Product = require('../models/product');

exports.getIndex = async (req, res) => {
  try {
    const products = await Product.fetchAll();
    
    res.render('./shop/index', {
      products,
      pageTitle: 'Shop',
      path: '/',
    });
  } catch (e) {
    console.error('Error while getting products on index page:', e.message);
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.fetchAll();
    
    res.render('./shop/products-list', {
      products,
      pageTitle: 'All Products',
      path: '/products',
    });
  } catch (e) {
    console.error('Error while getting products on products page:', e.message);
  }
};

exports.getProductDetails = async (req, res) => {
  const { productId } = req.params;
  
  try {
    const product = await Product.findById(productId);
    
    res.render('./shop/product-details', {
      product,
      pageTitle: product.title,
      path: '/products',
    });
  } catch (e) {
    console.error('Error while getting product details: ', e.message);
  }
};

exports.getCart = async (req, res) => {
  try {
    const products = await req.user.getCart();
    
    res.render('./shop/cart', {
      pageTitle: 'Your Cart',
      path: '/cart',
      products,
    });
  } catch (e) {
    console.error('Error while getting Cart or Products in a Cart: ', e.message);
  }
};

exports.postAddToCart = async (req, res) => {
  const { productId } = req.body;
  
  try {
    const product = await Product.findById(productId);
    await req.user.addToCart(product);
    res.redirect('/products');
  } catch (e) {
    console.error('Error while adding product to a cart:', e.message);
    if (e.message === 'Product not found') {
      res.status(404).send('Product not found!');
    } else {
      res.status(500).send('An error occurred while adding the product to the cart.');
    }
  }
};

exports.postDeleteProductFromCart = async (req, res) => {
  const { productId } = req.body;
  
  try {
    await req.user.deleteCartItem(productId);
    res.redirect('/cart');
  } catch (e) {
    console.error('Error while deleting Product from a Cart: ', e.message);
  }
};

exports.getCheckout = (req, res) => {
  res.render('./shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout',
  });
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await req.user.getOrders();
    
    res.render('./shop/orders', {
      pageTitle: 'Your Orders',
      path: '/orders',
      orders,
    });
  } catch (e) {
    console.error('Error:', e.message);
  }
};

exports.postCreateOrder = async (req, res) => {
  try {
    await req.user.createOrder();
    
    res.redirect('/cart');
  } catch (e) {
    console.error('Error:', e.message);
  }
  
};
