const express = require("express");

const {
  addDrink,
  getDrinks,
  deleteDrink
} = require("../controlers/drinkcontroler");

const router = express.Router();

router.post("/", addDrink);
router.get("/", getDrinks);
router.delete("/:id", deleteDrink);

module.exports = router;