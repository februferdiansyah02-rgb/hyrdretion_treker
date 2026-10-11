const supabase = require("../config/supabase");

// Catatan: `req.user` diisi oleh middleware auth (berisi user yang login).
// Kita selalu pakai req.user.id supaya data terpisah per user.

// GET /api/drinks -> daftar minuman milik user yang sedang login
const getDrinks = async (req, res) => {
  const { data, error } = await supabase
    .from("drinks")
    .select("*")
    .eq("user_id", req.user.id) // hanya ambil punya user ini
    .order("time", { ascending: false });

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json({ data });
};

// POST /api/drinks -> catat minum air baru
const addDrink = async (req, res) => {
  const { amount, time } = req.body;
  const parsedAmount = Number(amount);

  // Validasi jumlah air harus angka positif.
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ message: "Water amount must be a positive number" });
  }

  // Kalau `time` tidak dikirim, pakai waktu sekarang.
  const parsedTime = time ? new Date(time) : new Date();
  if (Number.isNaN(parsedTime.getTime())) {
    return res.status(400).json({ message: "Invalid time format" });
  }

  const { data, error } = await supabase
    .from("drinks")
    .insert([
      {
        amount: parsedAmount,
        time: parsedTime.toISOString(),
        user_id: req.user.id, // simpan pemiliknya
      },
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.status(201).json({ message: "Water intake recorded successfully", data });
};

// DELETE /api/drinks/:id -> hapus catatan minum
const deleteDrink = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  const { data, error } = await supabase
    .from("drinks")
    .delete()
    .eq("id", id)
    .eq("user_id", req.user.id) // tidak bisa hapus punya orang lain
    .select()
    .maybeSingle(); // kalau tidak ada baris yang cocok, data = null

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  if (!data) {
    return res.status(404).json({ message: "Data tidak ditemukan" });
  }

  res.json({ message: "Water intake deleted successfully", data });
};

module.exports = {
  getDrinks,
  addDrink,
  deleteDrink,
};
