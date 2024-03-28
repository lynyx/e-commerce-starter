require('dotenv').config({ path: `./environments/${process.env.NODE_ENV}.env` });
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const { pageNotFound } = require('./controllers/404');
const User = require('./models/user');


const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'sessions',
  // expires: 1000 * 60 * 60, // Expires in 1 hour
})

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'Should be very long string here for a production',
  resave: false,
  saveUninitialized: false,
  store,
  // cookie: { maxAge: 1000 * 3600 }, // If Not specified - it's treated as a Session cookie.
}));

app.use(async (req, res, next) => {
  if (req.session.user) {
    try {
      req.user = await User.findById(req.session.user._id);
    } catch (e) {
      console.error('Error while setting req.user:', e.message);
    }
  }
  
  next();
});

app.use(authRoutes);
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
