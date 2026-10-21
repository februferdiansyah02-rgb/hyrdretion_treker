require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");


const drinkRoutes = require("./Routes/drinkroutes");
const remindRoutes = require("./Routes/remindroutes");
const notesRoutes = require("./Routes/notesroutes");
const pushRoutes = require("./Routes/pushroutes");

const { requireAuth } = require("./middleware/auth");
const { runReminderPushJob } = require("./jobs/reminderPushJob");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.json({
    message: "Hydration Tracker API berhasil berjalan!"
  });
});


app.use("/api/drinks", requireAuth, drinkRoutes);
app.use("/api/reminders", requireAuth, remindRoutes);
app.use("/api/notes", requireAuth, notesRoutes);
app.use("/api/push", requireAuth, pushRoutes);

// Jalankan job tiap menit buat kirim Web Push pas waktunya (bisa jalan meski app ditutup)
cron.schedule("* * * * *", runReminderPushJob);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});