// const fs = require('node:fs');
// const path = require('node:path');
const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');
const handleError = require("../util/handleError");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const rootDir = require('../util/path');

const ITEMS_PER_PAGE = 2;

exports.getIndex = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    const totalItems = await Product.countDocuments();
    
    const products = await Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
    
    res.render('shop/index', {
      products,
      pageTitle: 'Shop',
      path: '/',
      totalItems,
      currentPage: page,
      hasNextPage: page * ITEMS_PER_PAGE < totalItems,
      nextPage: page + 1,
      hasPrevPage: (page - 1) > 0,
      prevPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  } catch (e) {
    handleError(e, next, 'Error while getting products on index page:');
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const page = +req.query.page || 1;
    const totalItems = await Product.countDocuments();
    
    const products = await Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);
    
    res.render('shop/products-list', {
      products,
      pageTitle: 'All Products',
      path: '/products',
      totalItems,
      currentPage: page,
      hasNextPage: page * ITEMS_PER_PAGE < totalItems,
      nextPage: page + 1,
      hasPrevPage: (page - 1) > 0,
      prevPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  } catch (e) {
    handleError(e, next, 'Error while getting products on products page:');
  }
};

exports.getProductDetails = async (req, res, next) => {
  const { productId } = req.params;
  
  try {
    const product = await Product.findById(productId);
    
    res.render('shop/product-details', {
      product,
      pageTitle: product.title,
      path: '/products',
    });
  } catch (e) {
    handleError(e, next, 'Error while getting product details:');
  }
};

const getCartItems = async (req) => {
  const user = await req.user.populate('cart.items.productId');
  const products = user.cart.items.filter(item => item.productId);
  
  // Remove products that are not found in the database
  const absentProductsIds = user.cart.items
    .filter(item => !item.productId)
    .map(product => product._id);
  
  if (absentProductsIds.length) {
    await Promise.all(absentProductsIds.map(productId => req.user.deleteCartItem(productId)));
  }
  
  return products;
}

exports.getCart = async (req, res, next) => {
  try {
    const products = await getCartItems(req);
    
    res.render('shop/cart', {
      pageTitle: 'Your Cart',
      path: '/cart',
      products,
    });
  } catch (e) {
    handleError(e, next, 'Error while getting Cart or Products in a Cart:');
  }
};

exports.getCheckout = async (req, res) => {
  try {
    const products = await getCartItems(req);
    const totalPrice = products.reduce((total, item) => total + item.productId.price * item.quantity, 0);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: products.map(item => ({
        quantity: item.quantity,
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.productId.title,
            description: item.productId.description,
            images: [`${req.protocol}://${req.get('host')}/${item.productId.imageUrl}`],
          },
          unit_amount: item.productId.price * 100,
        },
      })),
      success_url: `${req.protocol}://${req.get('host')}/checkout/success`, // TODO: Add a webhook to handle success payment and prevent user from accessing the page without payment
      cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`,
    });
    
    res.render('shop/checkout', {
      pageTitle: 'Checkout',
      path: '/checkout',
      products,
      totalPrice,
      sessionId: session.id,
    });
  } catch (e) {
    console.error('Error while getting checkout:', e.message);
  }
};

exports.postAddToCart = async (req, res, next) => {
  const { productId } = req.body;
  
  try {
    const product = await Product.findById(productId);
    await req.user.addToCart(product);
    res.redirect('/products');
  } catch (e) {
    handleError(e, next, 'Error while adding product to a cart:');
  }
};

exports.postDeleteProductFromCart = async (req, res, next) => {
  const { productId } = req.body;
  
  try {
    await req.user.deleteCartItem(productId);
    res.redirect('/cart');
  } catch (e) {
    handleError(e, next, 'Error while deleting Product from a Cart:');
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ 'user.userId': req.user._id });
    
    res.render('shop/orders', {
      pageTitle: 'Your Orders',
      path: '/orders',
      orders,
    });
  } catch (e) {
    handleError(e, next, 'Error while getting orders:');
  }
};

exports.getCheckoutSuccess = async (req, res, next) => {
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
    
    res.redirect('/orders');
  } catch (e) {
    handleError(e, next, 'Error while posting an Order:');
  }
};

exports.getInvoice = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return handleError(new Error('Order not found'), next, 'Error while getting an Invoice:');
    }
    
    if (!order.user.userId.equals(req.user._id)) {
      return handleError(new Error('Unauthorized'), next, 'Error while getting an Invoice:', 403);
    }
    
    const fileName = `invoice-${orderId}.pdf`;
    // const filePath = path.join(rootDir, 'data', 'invoices', fileName);
    
    res.setHeader('Content-Type', 'Application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    
    const doc = new PDFDocument();
    
    // doc.pipe(fs.createWriteStream(filePath));
    doc.pipe(res);
    
    doc.fontSize(24).text('Invoice', {
      bold: true,
    });
    
    doc.lineWidth(2) // make the line bolder
      .moveTo(50, 100) // set the current point
      .lineTo(550, 100) // draw a line to another point
      .stroke(); // stroke the path
    
    doc.moveDown(); // add some space between the line and the text
    
    let total = 0;
    order.products.forEach(({ product: { title, price }, quantity }) => {
      total += price * quantity;
      doc.fontSize(14).text(`${title} - ${quantity} x $${price}`);
    });
    
    doc.lineWidth(2) // make the line bolder
      .moveTo(60, 165) // set the current point
      .lineTo(260, 165) // draw a line to another point
      .stroke(); // stroke the path
    
    doc.moveDown(); // add some space between the line and the text
    doc.fontSize(20).text(`Total: $${total}`);
    
    doc.end();
  } catch (e) {
    handleError(e, next, 'Error while getting an Invoice:');
  }
}
