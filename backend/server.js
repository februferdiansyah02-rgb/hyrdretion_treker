require("dotenv").config();
const express = require("express");
const cors = require("cors");


const drinkRoutes = require("./Routes/drinkroutes");
const remindRoutes = require("./Routes/remindroutes");
const notesRoutes = require("./Routes/notesroutes");

const { requireAuth } = require("./middleware/auth");

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

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});