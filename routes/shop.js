const express = require('express');

const {
  getCart,
  getCheckout,
  getIndex,
  getOrders,
  getProductDetails,
  getProducts,
  postAddToCart,
  postCreateOrder,
  postDeleteProductFromCart,
} = require('../controllers/shop');

const router = express.Router();

router.get('/', getIndex);
router.get('/products/:productId', getProductDetails);
router.post('/add-to-cart', postAddToCart);
router.get('/products', getProducts);
router.get('/cart', getCart);
router.post('/cart-delete-item', postDeleteProductFromCart);
router.post('/create-order', postCreateOrder)
router.get('/orders', getOrders);
router.get('/checkout', getCheckout);

module.exports = router;