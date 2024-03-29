const { Router } = require('express');

const { getLogin, postLogin, postLogout, getSignup, postSignup } = require('../controllers/auth');

const router = Router();

router.get('/login', getLogin);
router.post('/login', postLogin);
router.post('/logout', postLogout);
router.get('/signup', getSignup);
router.post('/signup', postSignup);

module.exports = router;
