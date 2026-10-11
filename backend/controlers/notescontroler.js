const supabase = require("../config/supabase");

const DEFAULT_GOAL = 2000; // target minum default: 2000 ml

// Ambil target dari query (?goal=2000). Kalau tidak valid, pakai default.
const getGoal = (req) => {
  const goal = Number(req.query.goal);
  if (!Number.isFinite(goal) || goal <= 0) return DEFAULT_GOAL;
  return goal;
};

// Ambil minuman HARI INI milik user yang login.
async function getTodayDrinks(userId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0); // jam 00:00 hari ini

  const { data, error } = await supabase
    .from("drinks")
    .select("*")
    .eq("user_id", userId)
    .gte("time", startOfDay.toISOString()); // hanya dari jam 00:00 ke atas

  if (error) throw new Error(error.message);

  return data || [];
}

// Jumlah total air hari ini.
const getTodayTotal = (drinks) =>
  drinks.reduce((total, drink) => total + Number(drink.amount), 0);

// Minuman paling akhir (kalau ada).
const getLastDrink = (drinks) => {
  if (drinks.length === 0) return null;
  return [...drinks].sort((a, b) => new Date(b.time) - new Date(a.time))[0];
};

// Bikin satu objek notifikasi.
const createNotification = (title, message, icon, createdAt = new Date()) => ({
  title,
  message,
  icon,
  createdAt: createdAt.toISOString(),
});

// GET /api/notes -> daftar notifikasi/peringatan
const getNotes = async (req, res) => {
  try {
    const goal = getGoal(req);
    const todayDrinks = await getTodayDrinks(req.user.id);
    const todayTotal = getTodayTotal(todayDrinks);
    const lastDrink = getLastDrink(todayDrinks);

    const now = new Date();
    const currentHour = now.getHours();
    const progress = (todayTotal / goal) * 100;

    const notifications = [];

    // 1. Pagi hari, belum minum sama sekali.
    if (currentHour >= 5 && currentHour < 10 && todayTotal === 0) {
      notifications.push(
        createNotification(
          "Good morning!",
          "Start your day with a glass of water. Your body will thank you!",
          "morning"
        )
      );
    }

    // 2. Sudah 2 jam belum minum (atau belum minum padahal sudah siang).
    if (lastDrink) {
      const lastDrinkTime = new Date(lastDrink.time);
      const hoursSinceLastDrink =
        (now.getTime() - lastDrinkTime.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastDrink >= 2 && todayTotal < goal) {
        notifications.push(
          createNotification(
            "Time to drink water!",
            "It's been 2 hours since your last intake. Stay hydrated!",
            "drop",
            lastDrinkTime
          )
        );
      }
    } else if (currentHour >= 10 && todayTotal < goal) {
      notifications.push(
        createNotification(
          "Time to drink water!",
          "You haven't recorded any water intake yet today. Stay hydrated!",
          "drop"
        )
      );
    }

    // 3. Sudah 50% menuju target.
    if (progress >= 50 && progress < 75) {
      notifications.push(
        createNotification(
          "Nice progress!",
          `You've reached ${Math.floor(progress)}% of your daily goal. Keep going!`,
          "progress"
        )
      );
    }

    // 4. Sudah 75% menuju target.
    if (progress >= 75 && progress < 100) {
      notifications.push(
        createNotification(
          "You're doing great!",
          `You're ${Math.floor(progress)}% to your daily goal. Almost there!`,
          "great"
        )
      );
    }

    // 5. Target harian tercapai.
    if (todayTotal >= goal) {
      notifications.push(
        createNotification(
          "Daily goal achieved!",
          "Congrats! You've reached your daily water intake target!",
          "goal"
        )
      );
    }

    // 6. Malam hari, target belum tercapai.
    if (currentHour >= 20 && currentHour < 24 && todayTotal < goal) {
      notifications.push(
        createNotification(
          "Don't forget!",
          "A little water before bed helps your body recover.",
          "drop"
        )
      );
    }

    // Kasih id, lalu urutkan dari yang paling baru.
    const result = notifications
      .map((notification, index) => ({ id: index + 1, ...notification }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ message: "Notifications berhasil diambil", data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotes };
