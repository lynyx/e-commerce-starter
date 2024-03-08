const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getIndex = async (req, res) => {
  try {
    const products = await Product.findAll();
    
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
    const products = await Product.findAll();
    
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
    const product = await Product.findByPk(productId);
    
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
    const cart = await req.user.getCart();
    const products = await cart.getProducts();
    
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
    const cart = await req.user.getCart();
    const [existingProduct] = await cart.getProducts({ where: { id: productId } });
    // console.log('existingProduct', existingProduct);
    let quantity = 1;
    
    if (existingProduct) {
      // Increase quantity
      quantity = existingProduct.cartItem.quantity + 1;
      await cart.addProduct(existingProduct, {
        through: {
          quantity,
        }
      });
    } else {
      // Add new Product to the cart.
      const product = await Product.findByPk(productId);
      await cart.addProduct(product, {
        through: {
          quantity,
        }
      });
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  res.redirect('/products');
};

exports.postDeleteProductFromCart = async (req, res) => {
  const { productId } = req.body;
  
  try {
    const cart = await req.user.getCart();
    const [product] = await cart.getProducts({ where: { id: productId } });
    await product.cartItem.destroy();
    
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
    const orders = await req.user.getOrders({ include: ['products'] });
    console.log(orders)
    
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
    const cart = await req.user.getCart();
    const products = await cart.getProducts();
    
    const order = await req.user.createOrder();
    await order.addProducts(products.map(product => {
      product.orderItem = { quantity: product.cartItem.quantity }
      return product;
    }));
    
    await cart.setProducts(null);
    
    res.redirect('/orders');
  } catch (e) {
    console.error('Error:', e.message);
  }
  
};
