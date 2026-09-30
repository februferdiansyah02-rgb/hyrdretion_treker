const profileRoutes = require("./Routes/profileroutes");

const express = require("express");
const cors = require("cors");

const drinkRoutes = require("./Routes/drinkroutes");

const app = express();

const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Hydration Tracker API berhasil berjalan!"
  });
});

const remindRoutes = require("./Routes/remindroutes");

app.use("/api/drinks", drinkRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/reminders", remindRoutes);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});