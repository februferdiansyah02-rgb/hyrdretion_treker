const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile
} = require("../controlers/profilecontroler");


router.get("/", getProfile);
router.put("/", updateProfile);

module.exports = router;