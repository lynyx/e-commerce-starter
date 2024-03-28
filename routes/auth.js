const { Router } = require('express');

const { getLogin, postLogin, postLogout } = require('../controllers/auth');

const router = Router();

router.get('/login', getLogin);
router.post('/login', postLogin);
router.post('/logout', postLogout);

module.exports = router;
