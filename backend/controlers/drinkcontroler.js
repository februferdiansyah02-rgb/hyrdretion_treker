const supabase = require("../config/supabase");

const addDrink = async (req, res) => {
  console.log("ADD DRINK REQUEST:", req.body);

  const { amount, time } = req.body;

  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({
      message: "Water amount must be a positive number",
    });
  }

  const parsedTime = time ? new Date(time) : new Date();

  if (Number.isNaN(parsedTime.getTime())) {
    return res.status(400).json({
      message: "Invalid time format",
    });
  }

  const { data, error } = await supabase
    .from("drinks")
    .insert([
      {
        amount: parsedAmount,
        time: parsedTime.toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }

  console.log("DRINK SAVED:", data);

  res.status(201).json({
    message: "Water intake recorded successfully",
    data,
  });
};

const getDrinks = async (req, res) => {
  console.log("GET DRINKS REQUEST");

  const { data, error } = await supabase
    .from("drinks")
    .select("*")
    .order("time", { ascending: false });

  if (error) {
    console.error("Supabase select error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }

  console.log("DRINKS FROM SUPABASE:", data);

  res.json({
    data,
  });
};

const deleteDrink = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({
      message: "Invalid ID",
    });
  }

  const { data, error } = await supabase
    .from("drinks")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Supabase delete error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }

  res.json({
    message: "Water intake deleted successfully",
    data,
  });
};

module.exports = {
  addDrink,
  getDrinks,
  deleteDrink,
};