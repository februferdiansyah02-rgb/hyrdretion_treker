const { getDrinkData } = require("./drinkcontroler");

const ICONS = ["drop", "progress", "morning", "great", "goal"];

const DEFAULT_GOAL = 2000;

const getGoal = (req) => {
  const goal = Number(req.query.goal);

  if (!Number.isFinite(goal) || goal <= 0) {
    return DEFAULT_GOAL;
  }

  return goal;
};

const getTodayDrinks = () => {
  const drinks = getDrinkData();

  const now = new Date();

  return drinks.filter((drink) => {
    const drinkDate = new Date(drink.time);

    return (
      drinkDate.getFullYear() === now.getFullYear() &&
      drinkDate.getMonth() === now.getMonth() &&
      drinkDate.getDate() === now.getDate()
    );
  });
};

const getTodayTotal = (drinks) => {
  return drinks.reduce((total, drink) => {
    return total + Number(drink.amount);
  }, 0);
};

const getLastDrink = (drinks) => {
  if (drinks.length === 0) {
    return null;
  }

  return [...drinks].sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  )[0];
};

const createNotification = (title, message, icon, createdAt = new Date()) => {
  return {
    title,
    message,
    icon,
    createdAt: createdAt.toISOString(),
  };
};

// GET /api/notes
const getNotes = (req, res) => {
  const goal = getGoal(req);

  const todayDrinks = getTodayDrinks();
  const todayTotal = getTodayTotal(todayDrinks);
  const lastDrink = getLastDrink(todayDrinks);

  const now = new Date();
  const currentHour = now.getHours();

  const progress = (todayTotal / goal) * 100;

  const notifications = [];

  // ==========================================
  // 1. GOOD MORNING
  // ==========================================
  if (currentHour >= 5 && currentHour < 10 && todayTotal === 0) {
    notifications.push(
      createNotification(
        "Good morning!",
        "Start your day with a glass of water. Your body will thank you!",
        "morning"
      )
    );
  }

  // ==========================================
  // 2. TIME TO DRINK WATER
  // ==========================================
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

  // ==========================================
  // 3. NICE PROGRESS - 50%
  // ==========================================
  if (progress >= 50 && progress < 75) {
    notifications.push(
      createNotification(
        "Nice progress!",
        `You've reached ${Math.floor(progress)}% of your daily goal. Keep going!`,
        "progress"
      )
    );
  }

  // ==========================================
  // 4. YOU'RE DOING GREAT - 75%
  // ==========================================
  if (progress >= 75 && progress < 100) {
    notifications.push(
      createNotification(
        "You're doing great!",
        `You're ${Math.floor(progress)}% to your daily goal. Almost there!`,
        "great"
      )
    );
  }

  // ==========================================
  // 5. DAILY GOAL ACHIEVED
  // ==========================================
  if (todayTotal >= goal) {
    notifications.push(
      createNotification(
        "Daily goal achieved!",
        "Congrats! You've reached your daily water intake target!",
        "goal"
      )
    );
  }

  // ==========================================
  // 6. DON'T FORGET - EVENING
  // ==========================================
  if (currentHour >= 20 && currentHour < 24 && todayTotal < goal) {
    notifications.push(
      createNotification(
        "Don't forget!",
        "A little water before bed helps your body recover.",
        "drop"
      )
    );
  }

  // ==========================================
  // TAMBAHKAN ID
  // ==========================================
  const result = notifications.map((notification, index) => ({
    id: index + 1,
    ...notification,
  }));

  // ==========================================
  // SORT TERBARU
  // ==========================================
  result.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  res.json({
    message: "Notifications berhasil diambil",
    data: result,
  });
};

module.exports = {
  ICONS,
  getNotes,
};