const { Router } = require('express');

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

const router = Router();

router.get('/login', getLogin);
router.post('/login', postLogin);
router.post('/logout', postLogout);
router.get('/signup', getSignup);
router.post('/signup', postSignup);
router.get('/reset', getResetPassword);
router.post('/reset', postResetPassword);
router.get('/reset/:token', getNewPassword);
router.post('/new-password', postNewPassword);

module.exports = router;
