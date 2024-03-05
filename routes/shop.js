const express = require('express');

const {
  getCart,
  getCheckout,
  getIndex,
  getOrders,
  getProductDetails,
  getProducts,
  postAddToCart,
  postDeleteProductFromCart,
} = require('../controllers/shop');

const router = express.Router();

router.get('/', getIndex);
router.get('/products/:productId', getProductDetails);
router.post('/add-to-cart', postAddToCart);
router.get('/products', getProducts);
router.get('/cart', getCart);
router.post('/cart-delete-item', postDeleteProductFromCart);
router.get('/orders', getOrders);
router.get('/checkout', getCheckout);

module.exports = router;
