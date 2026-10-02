const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const dayKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

export const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const formatLiter = (ml) => (ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : `${ml}ml`);

export const parseDrinks = (drinks) =>
  (drinks || [])
    .filter((drink) => !Number.isNaN(new Date(drink.time).getTime()))
    .map((drink) => ({ ...drink, amount: Number(drink.amount), date: new Date(drink.time) }));

export const buildDailyTotals = (drinks) => {
  const totals = new Map();

  drinks.forEach((drink) => {
    const key = dayKey(drink.date);
    totals.set(key, (totals.get(key) || 0) + drink.amount);
  });

  return totals;
};

export const getTodayTotal = (totals, now = new Date()) =>
  totals.get(dayKey(now)) || 0;

export const buildWeekly = (totals, now = new Date()) => {
  const cursor = startOfDay(now);
  const days = [];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(cursor);
    date.setDate(cursor.getDate() - i);

    const key = dayKey(date);

    days.push({
      date,
      key,
      label: WEEKDAYS[date.getDay()],
      value: totals.get(key) || 0,
    });
  }

  return days;
};

export const getMonthTotal = (drinks, now = new Date()) =>
  drinks
    .filter(
      (drink) =>
        drink.date.getFullYear() === now.getFullYear() &&
        drink.date.getMonth() === now.getMonth()
    )
    .reduce((sum, drink) => sum + drink.amount, 0);

export const getStreak = (totals, goal, now = new Date()) => {
  let count = 0;
  const cursor = startOfDay(now);

  if ((totals.get(dayKey(cursor)) || 0) < goal) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while ((totals.get(dayKey(cursor)) || 0) >= goal) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return count;
};

export const getDaysElapsed = (now = new Date()) => now.getDate();

export const getPeriodSummary = (period, { todayTotal, weekly, monthTotal, goal, daysElapsed }) => {
  if (period === "weekly") {
    return {
      total: weekly.reduce((sum, day) => sum + day.value, 0),
      target: goal * 7,
      label: "This week",
    };
  }

  if (period === "monthly") {
    return {
      total: monthTotal,
      target: goal * daysElapsed,
      label: "This month",
    };
  }

  return { total: todayTotal, target: goal, label: "Today" };
};

export const getInsight = (todayTotal, goal) => {
  const target = goal || 1;
  const progress = (todayTotal / target) * 100;

  if (todayTotal === 0) {
    return "Belum ada air tercatat hari ini. Yuk mulai dari gelas pertama!";
  }

  if (progress >= 100) {
    return "Hebat! Target harian kamu sudah tercapai hari ini.";
  }

  if (progress >= 75) {
    return "Sudah 75%! Sedikit lagi menuju target harian kamu.";
  }

  if (progress >= 50) {
    return "Sudah lebih dari separuh, jangan berhenti di sini!";
  }

  return "Setiap tegukan itu penting. Yuk kejar target hari ini!";
};