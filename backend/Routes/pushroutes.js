const express = require("express");
const {
  saveSubscription,
  getVapidPublicKey,
  testPush,
} = require("../controlers/pushcontroller");

const router = express.Router();

router.get("/vapid-public-key", getVapidPublicKey);
router.post("/subscribe", saveSubscription);
router.post("/test", testPush);

module.exports = router;
