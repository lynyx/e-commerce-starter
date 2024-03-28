const User = require('../models/user');

exports.getLogin = async (req, res) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.session.user,
  });
}

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  
  req.session.user = await User.findById('6602e636b9cc0406eaa91746');
  req.session.save((err) => {
    if (err) throw new Error(err.message);
    
    res.redirect('/');
  });
}

exports.postLogout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) throw new Error(err.message);
    
    res.redirect('/');
  })
}
