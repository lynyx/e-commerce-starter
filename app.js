require('dotenv').config({ path: `./environments/${process.env.NODE_ENV}.env` });
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const { pageNotFound } = require('./controllers/404');
const User = require('./models/user');


const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

let testUserId;
app.use(async (req, res, next) => {
  try {
    req.user = await User.findById('6602e636b9cc0406eaa91746');
    next();
  } catch (e) {
    console.error('Error while getting a user:', e.message);
  }
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(pageNotFound);


const initializeApp = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne();
    
    if (!user) {
      const user = new User({ name: 'Kos', email: 'email@test.com', cart: { items: [] } });
      await user.save();
    }
    
    app.listen(3000);
  } catch (e) {
    console.error('Error while initializing app:', e.message);
  }
};

(() => initializeApp())();

process.on('SIGINT', async () => {
  try {
    console.log('\nGracefully shutting down. Closing MongoDB connection...');
    await client.close();
    process.exit(0);
  } catch (e) {
    console.error('Error while closing MongoDB connection:', e.message);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  try {
    console.log('\nGracefully shutting down. Closing MongoDB connection...');
    await client.close();
    process.exit(0);
  } catch (e) {
    console.error('Error while closing MongoDB connection:', e.message);
    process.exit(1);
  }
});
