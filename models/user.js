const { getDb } = require('../util/database');
const { ObjectId } = require("mongodb");

class User {
  constructor(username, email, cart, userId) {
    this.name = username;
    this.email = email;
    this.cart = cart;
    this._id = userId ? new ObjectId(userId) : null;
  }
  
  async save() {
    const db = getDb();
    
    try {
      await db.collection('users').insertOne(this);
    } catch (e) {
      console.error('Error while saving a user:', e.message);
    }
  }
  
  async addToCart(product) {
    const existingProductIndex = this.cart.items.findIndex(eProd => {
      // Compare two ObjectId with MongoDB ObjectId's `.equals()` method
      return eProd.productId.equals(product._id);
      // or can be compared as a strings
      // return eProd.productId.toString() === product._id.toString();
    });
    
    const updatedCartItems = [...this.cart.items];
    
    if (existingProductIndex !== -1) {
      // Product already in the cart
      updatedCartItems.at(existingProductIndex).quantity++;
    } else {
      updatedCartItems.push({ productId: new ObjectId(product._id), quantity: 1 });
    }
    
    const cart = { items: updatedCartItems };
    
    const db = getDb();
    await db
      .collection('users')
      .updateOne(
        { _id: this._id },
        { $set: { cart } },
      );
  }
  
  async getCartProducts() {
    const db = getDb();
    const productIds = this.cart.items.map(item => item.productId);
    const products = await db.collection('products').find({ _id: { $in: productIds } }).toArray();
    
    // Remove products that are not in the database anymore.
    const absentIds = productIds.filter(productId => !products.some(product => product._id.equals(productId)));
    absentIds.forEach(id => this.deleteCartItem(id));
    
    return products;
  }
  
  async calculateTotalCartPrice() {
    const products = await this.getCartProducts();
    const sum = products.reduce((acc, currVal) => {
      return acc + parseFloat(currVal.price);
    }, 0);
    
    return sum.toString();
  }
  
  async getCart() {
    const products = await this.getCartProducts();
    
    return products.map(product => ({
      ...product,
      quantity: this.cart.items.find(item => item.productId.equals(product._id))?.quantity || 0,
    }));
  }
  
  async deleteCartItem(productId) {
    const updatedProducts = this.cart.items.filter(item => item.productId.toString() !== productId.toString());
    
    const db = getDb();
    await db
      .collection('users')
      .updateOne(
        { _id: this._id },
        { $set: { cart: { items: updatedProducts } } },
      );
  }
  
  async createOrder() {
    const totalPrice = await this.calculateTotalCartPrice();
    const products = await this.getCart();
    const order = {
      products,
      totalPrice,
      user: {
        userId: this._id,
        name: this.name,
        email: this.email,
      },
    }
    
    const db = getDb();
    await db.collection('orders').insertOne(order);
    
    this.cart = { items: [] };
    await db.collection('users').updateOne(
      { _id: this._id },
      { $set: { cart: { items: [] } } },
    );
  }
  
  async getOrders() {
    const db = getDb();
    return await db.collection('orders').find({ 'user.userId': this._id }).toArray();
  }
  
  static async findById(userId) {
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      throw new Error('User not found!');
    }
    
    return user;
  }
}

module.exports = User;
