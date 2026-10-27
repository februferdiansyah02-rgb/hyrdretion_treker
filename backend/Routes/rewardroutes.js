const express = require("express");

const {
  getRewards,
  checkIn,
  getCatalog,
  redeemReward,
  getVouchers,
} = require("../controlers/rewardcontroller");

const router = express.Router();

// Saldo, streak, dan riwayat poin masuk.
router.get("/", getRewards);

// Daily check-in.
router.post("/check-in", checkIn);

// Katalog makanan/minuman.
router.get("/catalog", getCatalog);

// Tukar poin menjadi voucher simulasi.
router.post("/redeem", redeemReward);

// Riwayat voucher pengguna.
router.get("/vouchers", getVouchers);

module.exports = router;