const express = require('express');
const router = express.Router();
const {login} = require('../controlers/logincontroler');

router.post('/login',login);
module.exports = router;