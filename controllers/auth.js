const User = require('../models/user');
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.getLogin = async (req, res) => {
  const [errorMessage] = req.flash('error');
  
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage,
  });
}

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      req.flash('error', 'Incorrect email or password!');
      return res.redirect('/login');
    }
    
    req.session.user = user;
    return req.session.save(err => {
      if (err) console.error(err);
      res.redirect('/');
    });
  } catch (e) {
    console.error('Error while login:', e.message);
  }
}

exports.postLogout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) throw new Error(err.message);
    
    res.redirect('/');
  })
}

exports.getSignup = async (req, res) => {
  const [errorMessage] = req.flash('error');
  
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage,
  });
}

exports.postSignup = async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (user) {
      req.flash('error', 'User with this email already exists!');
      return res.redirect('/signup');
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const newUser = new User({
      email,
      password: hashedPassword,
      cart: { items: [] },
    });
    await newUser.save();
    res.redirect('/login');
    await sgMail.send(getSignupEmail(email)).then(() => {
      console.log(`Email sent to ${email}!`);
    });
  } catch (e) {
    console.error('Error while signing up:', e.message);
  }
}

getSignupEmail = (email) => {
  return {
    to: email,
    from: process.env.SENDGRID_SENDER_EMAIL, // Add your verified sender to .env file
    subject: 'Registration Successful',
    html: '<strong>Congratulations, your registration was successful!</strong>',
  };
}
