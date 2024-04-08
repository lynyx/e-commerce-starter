const { validationResult } = require('express-validator');

const Product = require("../models/product");
const handleError = require('../util/handeError');

exports.getAddProduct = async (req, res) => {
  res.render('admin/edit-product', {
    isEdit: false,
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    product: { title: '', imageUrl: '', price: '', description: '' },
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = async (req, res, next) => {
  const { title, price, description } = req.body;
  const errors = validationResult(req);
  
  // Get random picture URL, for production should be extracted from the req.body
  const resolution = Math.floor(Math.random() * 8 + 3) * 100;
  const imageUrl = `https://picsum.photos/${resolution}`;
  
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      isEdit: false,
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      product: { title, imageUrl, price, description },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  
  try {
    const product = new Product({
      title,
      price: parseFloat(price),
      imageUrl,
      description,
      // userId: req.user._id,
      // OR mongoose will get userId from whole user object like so:
      userId: req.user,
    });
    await product.save();
    res.redirect('/admin/products');
  } catch (e) {
    handleError(e, next, 'Error while adding product to database:');
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    // const products = await Product.find({ userId: req.user._id }); // Find products created by current the user.
    const products = await Product.find();
    
    res.render('admin/products-list', {
      pageTitle: 'Admin Products',
      path: '/admin/products',
      products,
    });
  } catch (e) {
    handleError(e, next, 'Error while getting products on admin products list:');
  }
  
};

exports.getEditProduct = async (req, res, next) => {
  const { isEdit } = req.query;
  const { productId } = req.params;
  
  if (!isEdit) {
    res.redirect('/admin/products');
  }
  
  try {
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.redirect('/admin/products');
    }
    
    res.render('admin/edit-product', {
      isEdit,
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      product,
      errorMessage: null,
      validationErrors: [],
    });
  } catch (err) {
    handleError(e, next, 'Error in getEditProduct controller:');
  }
};

exports.postEditProduct = async (req, res, next) => {
  const { title, imageUrl, price, description, productId } = req.body;
  
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      isEdit: true,
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      product: { title, imageUrl, price, description, _id: productId },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  
  try {
    // Can be updated by retrieving an existing document from DB
    // const product = await Product.findById(productId);
    // Object.assign(product, { title, price, description, imageUrl });
    // await product.save();
    
    // OR using findOneAndUpdate() method.
    
    await Product.findOneAndUpdate({ _id: productId }, {
      title,
      price: parseFloat(price),
      description,
      imageUrl
    }, { new: true });
    
    res.redirect('/admin/products');
  } catch (e) {
    handleError(e, next, 'Error while updating product:');
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const { productId } = req.body;
  
  try {
    await Product.findByIdAndDelete(productId);
  } catch (e) {
    handleError(e, next, `Error while deleting product ${productId}:`);
  } finally {
    res.redirect('/admin/products');
  }
};
