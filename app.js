const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const { pageNotFound } = require('./controllers/404');
const { mongoConnect, client } = require('./util/database');
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
    const { name, email, cart, _id } = await User.findById('65fd9375a1c5c14a4bbb2010');
    req.user = new User(name, email, cart, _id);
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
    await mongoConnect();
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
