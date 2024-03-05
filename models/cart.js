const path = require('node:path');
const { readFile, writeFile } = require('node:fs/promises');

const rootDir = require('../util/path');

const pathToFile = path.join(rootDir, 'data', 'cart.json');


module.exports = class Cart {
  
  static async addProduct(id, price) {
    // Fetch the previous cart
    const cart = await Cart._readCartFile();
    
    // Analyze the cart / Find existing products
    const existingProductIndex = cart.products.findIndex(product => id === product.id);
    const existingProduct = cart.products[existingProductIndex];
    //
    // // Add new product / increase quantity
    // let updatedProduct;
    // if (existingProduct) {
    //   updatedProduct = { ...existingProduct };
    //   updatedProduct.qty = updatedProduct.qty + 1;
    //   cart.products = [...cart.products];
    //   cart.products[existingProductIndex] = updatedProduct;
    // } else {
    //   updatedProduct = { id, qty: 1 };
    //   cart.products = [...cart.products, updatedProduct];
    // }
    
    // Add new product / increase quantity
    if (existingProduct) {
      cart.products[existingProductIndex].qty += 1;
    } else {
      cart.products.push({ id, qty: 1 });
    }
    
    cart.totalPrice = cart.totalPrice + +price;
    
    await Cart._writeCartToFile(cart)
  }
  
  static async fetchAll() {
    return Cart._readCartFile();
  }
  
  static async deleteProduct(id, price) {
    const cart = await Cart._readCartFile();
    
    const product = cart.products.find(product => product.id === id);
    
    if (!product) {
      return;
    }
    
    cart.products = cart.products.filter(product => product.id !== id);
    cart.totalPrice -= +price * cart.qty;
    
    await Cart._writeCartToFile(cart);
  }
  
  static async _readCartFile() {
    try {
      const cartData = await readFile(pathToFile);
      return JSON.parse(cartData.toString());
    } catch (e) {
      return { products: [], totalPrice: 0 };
    }
    
  }
  
  static async _writeCartToFile(cart) {
    try {
      await writeFile(pathToFile, JSON.stringify(cart, null, 2));
    } catch (e) {
      console.error('Error while writing Cart to file:', e.message);
    }
  }
}
