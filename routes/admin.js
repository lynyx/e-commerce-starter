const { Router } = require('express');
const { requireAuth } = require('../middlewares/auth');

const {
  getAddProduct,
  postAddProduct,
  getEditProduct,
  getProducts,
  postEditProduct,
  postDeleteProduct
} = require('../controllers/admin');

const router = Router();

router.get('/add-product', requireAuth, getAddProduct);
router.post('/add-product', requireAuth, postAddProduct);
router.get('/products', requireAuth, getProducts);
router.get('/edit-product/:productId', requireAuth, getEditProduct);
router.post('/edit-product', requireAuth, postEditProduct);
router.post('/delete-product', requireAuth, postDeleteProduct);

module.exports = router;
