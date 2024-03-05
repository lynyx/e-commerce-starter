const path = require('node:path');
const { readFile, writeFile } = require('node:fs/promises');

const Cart = require('./cart');
const rootDir = require('../util/path');

module.exports = class Product {
  constructor(id, title, price, imageUrl, description) {
    this.id = id;
    this.title = title;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
  }
  
  async save() {
    const products = await Product._getProducts();
    const updatedProducts = [...products];
    
    if (this.id) {
      const foundProductIndex = updatedProducts.findIndex(product => product.id === this.id);
      updatedProducts[foundProductIndex] = this;
    } else {
      this.id = Math.random().toString();
      updatedProducts.push(this);
    }
    
    await Product._writeProductsToFile(updatedProducts);
  }
  
  static async fetchAll() {
    return await Product._getProducts();
  }
  
  static async getById(id) {
    const products = await this._getProducts();
    return products.find(product => product.id === id);
  }
  
  static async deleteProduct(productId) {
    const products = await Product._getProducts();
    
    const productPrice = products.find(product => product.id === productId)?.price;
    const updatedProducts = products.filter(product => product.id !== productId);
    
    try {
      await Cart.deleteProduct(productId, productPrice);
      await Product._writeProductsToFile(updatedProducts);
    } catch (e) {
      console.error('Error while Deleting Product: ==>> ', e.message);
    }
  }
  
  static async _getProducts() {
    const pathToFile = path.join(rootDir, 'data', 'products.json');
    
    try {
      const data = await readFile(pathToFile);
      return JSON.parse(data.toString());
    } catch (e) {
      return [];
    }
  }
  
  static async _writeProductsToFile(products) {
    const pathToFile = path.join(rootDir, 'data', 'products.json');
    
    try {
      await writeFile(pathToFile, JSON.stringify(products, null, 2));
    } catch (e) {
      console.error('Error while writing Products to file: ', e.message);
    }
  }
}
