const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  // name: {
  //   type: String,
  //   required: true,
  // },
  email: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [{
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    }],
  },
});

userSchema.methods.addToCart = async function(product) {
  const existingProductIndex = this.cart.items.findIndex(item => {
    // Compare two ObjectId with MongoDB ObjectId's `.equals()` method
    return item.productId.equals(product._id);
    // or can be compared as a strings
    // return eProd.productId.toString() === product._id.toString();
  });
  
  const updatedCartItems = [...this.cart.items];
  
  if (existingProductIndex !== -1) {
    // Product already in the cart
    updatedCartItems.at(existingProductIndex).quantity++;
  } else {
    updatedCartItems.push({ productId: product._id, quantity: 1 });
  }
  
  this.cart = { items: updatedCartItems };
  return this.save();
};

userSchema.methods.deleteCartItem = async function(productId) {
  this.cart.items = this.cart.items.filter(item => item.productId && !item.productId.equals(productId));
  await this.save();
}

userSchema.methods.clearCart = async function() {
  this.cart.items = [];
  await this.save();
}

module.exports = model('User', userSchema);
