const seedDrink = (daysAgo, hour, amount) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 0, 0, 0);

  return {
    amount,
    time: date.toISOString(),
  };
};

const seedDays = [
  [6, [250, 500, 250, 500, 500]],
  [5, [250, 500, 250, 500, 500]],
  [4, [500, 500, 250]],
  [3, [250, 500, 500, 250, 500]],
  [2, [250, 250, 500, 500, 700]],
  [1, [500, 500, 250, 350, 500]],
  [0, [250]],
];

const START_HOUR = 7;
const GAP_HOURS = 2;

let drinks = seedDays.flatMap(([daysAgo, amounts]) =>
  amounts.map((amount, index) =>
    seedDrink(daysAgo, START_HOUR + index * GAP_HOURS, amount)
  )
);

let nextId = drinks.length + 1;

const parseTime = (value) => {
  if (value === undefined || value === null || value === "") {
    return new Date();
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const addDrink = (req, res) => {
  const { amount, time } = req.body;

  if (!amount) {
    return res.status(400).json({
      message: "Jumlah air harus diisi"
    });
  }

  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({
      message: "Jumlah air harus berupa angka positif"
    });
  }

  const parsedTime = parseTime(time);

  if (!parsedTime) {
    return res.status(400).json({
      message: "Format waktu tidak valid"
    });
  }

  const drink = {
    id: nextId,
    amount: parsedAmount,
    time: parsedTime,
  };

  nextId++;

  drinks.push(drink);

  res.status(201).json({
    message: "Pencatatan air berhasil",
    data: drink
  });
};
const getDrinks = (req, res) => {
  res.json({
    data: drinks
  });
};

const deleteDrink = (req, res) => {
  const id = parseInt(req.params.id);

  const index = drinks.findIndex((drink) => drink.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Data minum tidak ditemukan"
    });
  }

  const deletedDrink = drinks.splice(index, 1);

  res.status(200).json({
    message: "Pencatatan air berhasil dihapus",
    data: deletedDrink[0]
  });
};

module.exports = {
  addDrink,
  getDrinks,
  deleteDrink
};