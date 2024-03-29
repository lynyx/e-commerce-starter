const { Schema, model } = require('mongoose');

const orderSchema = new Schema({
  products: [{
    product: {
      _id: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      imageUrl: {
        type: String,
        required: true,
      },
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      }
    },
    quantity: {
      type: Number,
      required: true,
    },
  }],
  totalPrice: {
    type: Number,
    required: true,
  },
  user: {
    email: {
      type: String,
      required: true,
    },
    // name: {
    //   type: String,
    //   required: true,
    // },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
});

module.exports = model('Order', orderSchema);
