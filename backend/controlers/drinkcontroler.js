let drinks = [];
let nextId = 1;

const addDrink = (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({
      message: "Jumlah air harus diisi"
    });
  }

  const drink = {
    id: nextId,
    amount: amount,
    time: new Date()
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