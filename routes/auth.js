const { Router } = require('express');
const { body, check } = require('express-validator');

const {
  getLogin,
  postLogin,
  postLogout,
  getSignup,
  postSignup,
  getResetPassword,
  postResetPassword,
  getNewPassword,
  postNewPassword,
} = require('../controllers/auth');
const User = require("../models/user");

const router = Router();

router.get('/login', getLogin);
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address!')
      .normalizeEmail(),
    body(
      'password',
      'Password must be at least 6 characters.'
    )
      .isLength({ min: 6 })
      .trim(),
  ],
  postLogin);

router.post('/logout', postLogout);

router.get('/signup', getSignup);
router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email address!')
      .custom(async (email, { req, path, location }) => {
        if (await User.findOne({ email })) throw new Error('User with this email already exists!');
        return true;
      })
      .normalizeEmail(),
    body(
      'password',
      'Password must be at least 6 characters.' // Common Error message for all validators instead `withMessage()` after each validator
    )
      .isLength({ min: 6 })
      .trim(),
    body('confirmPassword')
      .trim()
      .custom((val, { req }) => {
        if (val !== req.body.password) throw new Error('Passwords must match!');
        return true;
      }),
  ],
  postSignup);

router.get('/reset', getResetPassword);
router.post('/reset', postResetPassword);

router.get('/reset/:token', getNewPassword);
router.post('/new-password', postNewPassword);

module.exports = router;
