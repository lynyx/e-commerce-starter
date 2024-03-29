const Product = require('../models/product');
const Order = require('../models/order');

exports.getIndex = async (req, res) => {
  try {
    const products = await Product.find();
    
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
    const products = await Product.find();
    
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
    const user = await req.user.populate('cart.items.productId');
    const products = user.cart.items.filter(item => item.productId);
    
    // Remove products that are not found in the database
    const absentProductsIds = user.cart.items
      .filter(item => !item.productId)
      .map(product => product._id);
    
    if (absentProductsIds.length) {
      await Promise.all(absentProductsIds.map(productId => req.user.deleteCartItem(productId)));
    }
    
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
    const orders = await Order.find({ 'user.userId': req.user._id });
    
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
    const user = await req.user.populate('cart.items.productId');
    const products = user.cart.items.map(item => ({ product: item.productId, quantity: item.quantity }));
    const totalPrice = products.reduce((total, item) => total + item.product.price * item.quantity, 0);
    
    const order = new Order({
      products,
      totalPrice,
      user: {
        userId: user,
        email: user.email,
      },
    });
    
    await order.save();
    await user.clearCart();
    
    res.redirect('/cart');
  } catch (e) {
    console.error('Error while posting an Order:', e);
    res.status(500).send('An error occurred while creating the order.');
  }
};
