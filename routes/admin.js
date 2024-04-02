const { Router } = require('express');
const { requireAuth, requireAdminPermissions } = require('../middlewares/auth');

const {
  getAddProduct,
  postAddProduct,
  getEditProduct,
  getProducts,
  postEditProduct,
  postDeleteProduct,
} = require('../controllers/admin');

const router = Router();

router.get('/add-product', requireAuth, requireAdminPermissions, getAddProduct);
router.post('/add-product', requireAuth, requireAdminPermissions, postAddProduct);
router.get('/products', requireAuth, requireAdminPermissions, getProducts);
router.get('/edit-product/:productId', requireAuth, requireAdminPermissions, getEditProduct);
router.post('/edit-product', requireAuth, requireAdminPermissions, postEditProduct);
router.post('/delete-product', requireAuth, requireAdminPermissions, postDeleteProduct);

module.exports = router;
