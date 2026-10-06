const express = require("express");
const cors = require("cors");


const profileRoutes = require("./Routes/profileroutes");
const drinkRoutes = require("./Routes/drinkroutes");
const remindRoutes = require("./Routes/remindroutes");
const notesRoutes = require("./Routes/notesroutes");


const loginRoutes = require("./Routes/loginRoutes");
const registerRoutes = require("./Routes/registerRoutes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.json({
    message: "Hydration Tracker API berhasil berjalan!"
  });
});


app.use("/api/drinks", drinkRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/reminders", remindRoutes);
app.use("/api/notes", notesRoutes);


app.use("/api/v1", loginRoutes);
app.use("/api/v1", registerRoutes);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});