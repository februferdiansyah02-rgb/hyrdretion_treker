const express = require('express');
const router = express.Router();
const { register } = require('../controlers/Registercontroler');

router.post('/register',register);

module.exports = router;