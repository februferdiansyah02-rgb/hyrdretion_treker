const express = require("express");

const {
  getNotes
} = require("../controlers/notescontroler");

const router = express.Router();

router.get("/", getNotes);

module.exports = router;