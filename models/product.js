const db = require('../util/database');
const Cart = require('./cart');

module.exports = class Product {
  constructor(id, title, price, imageUrl, description) {
    this.id = id;
    this.title = title;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
  }
  
  async save() {
    await db.execute(
      'INSERT INTO products (title, price, imageUrl, description) VALUES (?,?,?,?)',
      [this.title, this.price, this.imageUrl, this.description],
    );
    
  }
  
  static async fetchAll() {
    const products = await db.execute('SELECT * FROM products');
    return products[0];
  }
  
  static async getById(id) {
    try {
      const productQuery = await db.execute('SELECT * FROM products WHERE products.id = ?', [id]);
      return productQuery[0][0];
    } catch (error) {
      console.error('Error while fetching product by ID:', error.message);
      throw error; // re-throw the error so it can be caught in the controller
    }
  }
  
  static async deleteProduct(productId) {
  }
}
