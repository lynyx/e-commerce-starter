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
  getCheckoutSuccess,
  postDeleteProductFromCart,
  getInvoice,
} = require('../controllers/shop');

const router = Router();

router.get('/', getIndex);
router.get('/products', getProducts);
router.get('/products/:productId', getProductDetails);

router.get('/cart', requireAuth, getCart);
router.post('/add-to-cart', requireAuth, postAddToCart);
router.post('/cart-delete-item', requireAuth, postDeleteProductFromCart);

router.get('/checkout', requireAuth, getCheckout);
router.get('/checkout/success', requireAuth, getCheckoutSuccess);
router.get('/checkout/cancel', requireAuth, getCheckout);

router.get('/orders', requireAuth, getOrders);
router.get('/orders/:orderId', requireAuth, getInvoice);

module.exports = router;
