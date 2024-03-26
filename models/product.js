const { getDb } = require('../util/database');
const { ObjectId } = require('mongodb');

class Product {
  constructor(title, price, imageUrl, description, productId, userId) {
    // Get random picture URL
    const resolution = Math.floor(Math.random() * 8 + 3) * 100;
    
    this.title = title;
    this.price = price;
    this.imageUrl = `https://picsum.photos/${resolution}`;
    this.description = description;
    this._id = productId ? new ObjectId(productId) : null;
    this.userId = userId ? new ObjectId(userId) : null;
  }
  
  async save() {
    const db = getDb();
    let saveOrUpdate;
    
    try {
      if (this._id) {
        // Update existing record
        saveOrUpdate = 'update';
        await db.collection('products').updateOne({ _id: this._id }, { $set: this });
      } else {
        // Create new one
        saveOrUpdate = 'save';
        await db.collection('products').insertOne(this);
      }
    } catch (e) {
      console.error(`Error while trying to ${saveOrUpdate} a product:`, e.message);
    }
  }
  
  static async fetchAll() {
    const db = getDb();
    return db.collection('products').find({}).toArray();
  }
  
  // Method to get a single product by id
  static async findById(productId) {
    const db = getDb();
    const product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
    
    if (!product) {
      throw new Error('Product not found!');
    }
    
    return product;
  }
  
  static async deleteById(productId) {
    const db = getDb();
    const result = await db.collection('products').deleteOne({ _id: new ObjectId(productId) });
    
    if (!result.deletedCount) {
      throw new Error('Product not found while deleting');
    }
  }
}

module.exports = Product;
