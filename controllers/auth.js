const crypto = require('node:crypto');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.getLogin = async (req, res) => {
  const [errorMessage] = req.flash('error');
  
  res.render('auth/login', {
    errorMessage,
    pageTitle: 'Login',
    path: '/login',
  });
};

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
};

exports.postLogout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) throw new Error(err.message);
    
    res.redirect('/');
  })
};

exports.getSignup = async (req, res) => {
  const [errorMessage] = req.flash('error');
  
  res.render('auth/signup', {
    errorMessage,
    pageTitle: 'Signup',
    path: '/signup',
  });
};

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
};

getSignupEmail = (email) => {
  return {
    to: email,
    from: process.env.SENDGRID_SENDER_EMAIL, // Add your verified sender to .env file
    subject: 'Registration Successful',
    html: '<strong>Congratulations, your registration was successful!</strong>',
  };
};

exports.getResetPassword = async (req, res) => {
  const [errorMessage] = req.flash('error');
  
  res.render('./auth/reset', {
    errorMessage,
    pageTitle: 'Reset Password',
    path: '/reset',
  });
};

exports.postResetPassword = async (req, res) => {
  const { email } = req.body;
  
  crypto.randomBytes(64, async (err, buf) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    
    const token = buf.toString('hex');
    
    try {
      const user = await User.findOne({ email });
      
      if (!user) {
        // Hande case if user not found.
        req.flash('error', 'User with this email doesn\'t exist');
        res.redirect('/reset');
      }
      
      Object.assign(user, {
        resetToken: token,
        resetTokenExpiration: Date.now() + 1000 * 60 * 60,
      });
      
      await user.save();
      res.redirect('/login');
      
      await sgMail.send({
        to: email,
        from: process.env.SENDGRID_SENDER_EMAIL,
        subject: 'Password Reset',
        html: `
        <p>You have requested password reset. This link will be valid 1 hour after request was submitted.</p> <br>
        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
      `,
      }).then(() => {
        console.log(`Reset Password Email was sent to ${email}.`);
      });
    } catch (e) {
      console.error('Error while resetting a password:', e);
    }
  });
};

exports.getNewPassword = async (req, res) => {
  const { token } = req.params;
  
  try {
    const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gte: Date.now() } });
    
    if (!user) {
      req.flash('error', 'The token has expired. Please try resetting your password again.');
      return res.redirect('/reset');
    }
    
    const [errorMessage] = req.flash('error');
    
    res.render('./auth/new-password', {
      errorMessage,
      pageTitle: 'Update Password',
      path: '/new-password',
      token,
      userId: user._id,
    })
  } catch (e) {
    console.error('Error while getting new password page:', e.message);
  }
};

exports.postNewPassword = async (req, res) => {
  const { userId, password, confirmPassword, token } = req.body;
  
  if (password !== confirmPassword) {
    req.flash('error', 'Password and Password Confirmation must match.');
    return res.redirect(`/reset/${token}`);
  }
  
  try {
    const user = await User.findOne({ _id: userId, resetToken: token, resetTokenExpiration: { $gte: Date.now() } });
    
    if (!user) {
      req.flash('error', 'The token has expired. Please try resetting your password again.');
      return res.redirect('/reset');
    }
    
    Object.assign(user, {
      password: await bcrypt.hash(password, 12),
      resetToken: undefined,
      resetTokenExpiration: undefined,
    });

    await user.save();
    return res.redirect('/login');
  } catch (e) {
    console.error('Error while setting a new password:', e.message);
  }
}
