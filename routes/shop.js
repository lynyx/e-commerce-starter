const { Router } = require('express');
const { requireAuth } = require('../middlewares/auth');

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

const router = Router();

router.get('/', getIndex);
router.get('/products', getProducts);
router.get('/products/:productId', getProductDetails);
router.get('/cart', requireAuth, getCart);
router.post('/add-to-cart', requireAuth, postAddToCart);
router.post('/cart-delete-item', requireAuth, postDeleteProductFromCart);
router.post('/create-order', requireAuth, postCreateOrder)
router.get('/orders', requireAuth, getOrders);
// router.get('/checkout', getCheckout);

module.exports = router;
