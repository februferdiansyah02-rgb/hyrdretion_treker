const express = require("express");

const {
    getReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    getAutoReminder,
    updateAutoReminder,
    getDueReminders,
    getHistory,
    resetReminderFired
} = require("../controlers/remindcontroler");

const router = express.Router();

router.get("/due", getDueReminders);
router.get("/history", getHistory);
router.get("/auto", getAutoReminder);
router.put("/auto", updateAutoReminder);
router.post("/reset/:id", resetReminderFired);

router.get("/", getReminders);
router.post("/", createReminder);
router.put("/:id", updateReminder);
router.delete("/:id", deleteReminder);

module.exports = router;