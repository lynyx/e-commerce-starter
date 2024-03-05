const express = require('express');

const {
  getAddProduct,
  postAddProduct,
  getEditProduct,
  getProducts,
  postEditProduct,
  postDeleteProduct
} = require('../controllers/admin');

const router = express.Router();

router.get('/add-product', getAddProduct);
router.post('/add-product', postAddProduct);

router.get('/products', getProducts);

router.get('/edit-product/:productId', getEditProduct);
router.post('/edit-product', postEditProduct);

router.post('/delete-product', postDeleteProduct);


module.exports = router;
