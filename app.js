require('dotenv').config({ path: `./environments/${process.env.NODE_ENV}.env` });
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require("cookie-parser");
const { doubleCsrf } = require('csrf-csrf');
const flash = require('connect-flash');
const multer = require('multer');

const { pageNotFound, serverError } = require('./controllers/errors');
const User = require('./models/user');
const csrfOptions = require("./configs/csrf-csrf");
const handleError = require("./util/handleError");


// Initializations
const app = express();
app.disable('x-powered-by'); // Disable 'X-Powered-By' header

const { doubleCsrfProtection } = doubleCsrf(csrfOptions);

const store = MongoStore.create({
  mongoUrl: process.env.MONGODB_URI,
  dbName: 'shop',
  collectionName: 'sessions',
  stringify: false,
  ttl: 60 * 60 * 24, // 1 day
  autoRemove: 'interval',
  autoRemoveInterval: 10, // 10 minutes
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'images'),
  filename: (req, file, cb) => {
    cb(null, `${new Date().toISOString()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  return ['image/png', 'image/jpg', 'image/jpeg']
    .includes(file.mimetype) ? cb(null, true) : cb(null, false);
}

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter }).single('image'))
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  name: process.env.NODE_ENV === 'production' ? '__Host-psifi.x-session' : 'psifi.x-session',
  resave: false,
  saveUninitialized: false,
  store,
  // cookie: { maxAge: 1000 * 3600 }, // If Not specified - it's treated as a Session cookie.
}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(doubleCsrfProtection);
app.use(flash());

app.use(async (req, res, next) => {
  res.locals.isAuthenticated = req.session.user;
  res.locals.isAdmin = req.session.user?.isAdmin;
  res.locals.csrf = req.csrfToken();
  next();
})

app.use(async (req, res, next) => {
  if (req.session.user) {
    try {
      req.user = await User.findById(req.session.user._id);
    } catch (e) {
      handleError(e, next, 'Error while setting req.user:');
    }
  }
  next();
});

app.use(authRoutes);
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.get('/500', serverError);
app.use(pageNotFound);

// Error Handling Middleware
app.use((err, req, res, next) => {
  // if (err.httpStatusCode === '403')
  // Or
  // res.status(err.httpStatusCode).render(...);
  console.error(err);
  res.status(err.httpStatusCode).render('500', {
    pageTitle: 'Error occurred!',
    path: '/500',
    isAuthenticated: req.session.user,
  });
})


const initializeApp = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
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
