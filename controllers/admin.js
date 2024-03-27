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
  
  // Get random picture URL, for real purpose should be extracted from the req.body
  const resolution = Math.floor(Math.random() * 8 + 3) * 100;
  const imageUrl = `https://picsum.photos/${resolution}`;
  
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
    console.error('Error while adding product to database: ', e.message);
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    
    res.render('./admin/products-list', {
      products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
    });
  } catch (e) {
    console.error('Error while getting products on admin products list:', e.message);
  }
  
};

exports.getEditProduct = async (req, res) => {
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
  const { title, imageUrl, price, description, productId } = req.body;
  
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
    console.error('Error while updating product: ', e.message);
  }
};

exports.postDeleteProduct = async (req, res) => {
  const { productId } = req.body;
  
  try {
    await Product.findByIdAndDelete(productId);
  } catch (e) {
    console.error(`Error while deleting product: `, e.message);
  } finally {
    res.redirect('/admin/products');
  }
};
