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
  
  const resolution = Math.floor(Math.random() * 8 + 3) * 100;
  
  const imageUrl = `https://picsum.photos/${resolution}`;
  
  try {
    await req.user.createProduct({ // "Magic" function created by Sequelize after setting up DB tables relations in app.js
      title,
      price,
      imageUrl,
      description,
      userId: req.user.id,
    });
    res.redirect('/admin/products');
  } catch (e) {
    console.error('Error while adding product to database: ', e.message);
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    
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
    const product = await Product.findByPk(productId);
    
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
  const { productId, title, imageUrl, price, description } = req.body;
  
  try {
    const product = await Product.findByPk(productId);
    Object.assign(product, { title, price, description });
    await product.save();
    res.redirect('/admin/products');
  } catch (e) {
    console.error('Error while updating product: ', e.message);
  }
};

exports.postDeleteProduct = async (req, res) => {
  const { productId } = req.body;
  
  try {
    // Removing product record from the table
    // await Product.destroy({ where: { id: productId } });
    // or
    
    // const product = await Product.findByPk(productId);
    const products = await req.user.getProducts({ // Only User who created a product can remove it.
      where: {
        id: productId,
      }
    });
    await products[0].destroy();
    
    res.redirect('/admin/products');
    
  } catch (e) {
    console.error(`Error while deleting product: `, e.message);
  }
  
};
