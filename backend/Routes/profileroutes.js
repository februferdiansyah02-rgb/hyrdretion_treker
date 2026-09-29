const express = require("express");

const {
  getProfile,
  updateProfile
} = require("../controlers/profilecontroler");

const router = express.Router();

router.get("/", getProfile);
router.put("/", updateProfile);

module.exports = router;