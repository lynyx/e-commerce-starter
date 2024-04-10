const { validationResult } = require('express-validator');

const Product = require("../models/product");
const handleError = require('../util/handleError');
const { deleteFile } = require('../util/file');

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
  // const resolution = Math.floor(Math.random() * 8 + 3) * 100;
  // const imageUrl = `https://picsum.photos/${resolution}`;
  
  const image = req.file;
  
  if (!image) {
    return res.status(422).render('admin/edit-product', {
      isEdit: false,
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      product: { title, price, description },
      errorMessage: 'File is not an image!',
      validationErrors: [],
    });
  }
  
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      isEdit: false,
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      product: { title, price, description },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  
  try {
    const product = new Product({
      title,
      price: parseFloat(price),
      imageUrl: image.path,
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
  const { title, price, description, productId } = req.body;
  const image = req.file;
  
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      isEdit: true,
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      product: { title, price, description, _id: productId },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  
  try {
    // Can be updated by retrieving an existing document from DB
    // const product = await Product.findById(productId);
    // Object.assign(product, { title, price, description });
    // await product.save();
    
    // OR using findOneAndUpdate() method.
    const oldProduct = await Product.findOneAndUpdate({ _id: productId }, {
      title,
      price: parseFloat(price),
      description,
      ...(image && { imageUrl: image.path }),
    });
    
    await deleteFile(oldProduct.imageUrl);
    res.redirect('/admin/products');
  } catch (e) {
    handleError(e, next, 'Error while updating product:');
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const { productId } = req.body;
  
  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      throw new Error(`Product with id ${productId} not found`);
    }
    
    await deleteFile(deletedProduct.imageUrl);
    res.redirect('/admin/products');
  } catch (e) {
    handleError(e, next, `Error while deleting product ${productId}:`);
  }
};
