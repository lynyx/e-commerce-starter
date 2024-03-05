const Product = require("../models/product");

exports.getAddProduct = (req, res) => {
  res.render('./admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    isEdit: false,
  });
};

exports.postAddProduct = async (req, res) => {
  const { title, price, description } = req.body;
  const imageUrl = 'https://picsum.photos/200';
  const product = new Product(null, title, price, imageUrl, description);
  
  try {
    await product.save();
    res.redirect('/admin/products');
  } catch (e) {
    console.error('Error while saving product to database: ', e.message);
  }
};

exports.getProducts = async (req, res) => {
  const prods = await Product.fetchAll();
  
  res.render('./admin/products-list', {
    prods,
    pageTitle: 'Admin Products',
    path: '/admin/products',
  });
};

exports.getEditProduct = async (req, res) => {
  const { isEdit } = req.query;
  const { productId } = req.params;
  
  try {
    const product = await Product.getById(productId);
    
    if (!product) {
      return res.redirect('/');
    }
    
    res.render('./admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      isEdit,
      product,
    });
  } catch (err) {
    console.error('Error in getEditProduct controller:', err.message);
    res.status(500).send('Server error');
  }
};

exports.postEditProduct = async (req, res) => {
  const { productId, title, imageUrl, price, description } = req.body;
  const product = new Product(productId, title, price, imageUrl, description);
  
  await product.save();
  
  res.redirect('/admin/products');
};

exports.postDeleteProduct = async (req, res) => {
  const { productId } = req.body;
  await Product.deleteProduct(productId);
  
  res.redirect('/admin/products');
};
