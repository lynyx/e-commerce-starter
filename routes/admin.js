const { Router } = require('express');
const { body } = require('express-validator');

const { requireAuth, requireAdminPermissions } = require('../middlewares/auth');

const {
  getAddProduct,
  postAddProduct,
  getEditProduct,
  getProducts,
  postEditProduct,
  deleteProduct,
} = require('../controllers/admin');

const router = Router();

router.get('/add-product', requireAuth, requireAdminPermissions, getAddProduct);
router.post(
  '/add-product',
  requireAuth,
  requireAdminPermissions,
  [
    body('title').isLength({ min: 3 }).trim().withMessage('Title must be at least 3 characters long'),
    body('price').isFloat().withMessage('Price must be a number'),
    body('description').isLength({
      min: 5,
      max: 1000
    }).trim().withMessage('Description must be between 5 and 1000 characters long'),
  ],
  postAddProduct,
);
router.get('/products', requireAuth, requireAdminPermissions, getProducts);
router.get('/edit-product/:productId', requireAuth, requireAdminPermissions, getEditProduct);
router.post(
  '/edit-product',
  requireAuth,
  requireAdminPermissions,
  [
    body('title').isLength({ min: 3 }).trim().withMessage('Title must be at least 3 characters long'),
    body('price').isFloat().withMessage('Price must be a number'),
    body('description').isLength({
      min: 5,
      max: 1000
    }).trim().withMessage('Description must be between 5 and 1000 characters long'),
  ],
  postEditProduct
);
router.delete('/product/:productId', requireAuth, requireAdminPermissions, deleteProduct);

module.exports = router;
