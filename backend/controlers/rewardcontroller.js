const { createClient } = require("@supabase/supabase-js");

// Semua fitur Rewards harus memakai sesi pengguna asli.
const withAuth = (handler) => async (req, res) => {
  const authorization = req.headers.authorization || "";
  const match = /^Bearer\s+(\S+)$/i.exec(authorization);

  if (!match) {
    return res.status(401).json({
      message: "Silakan login untuk membuka Rewards.",
    });
  }

  try {
    const token = match[1];

    const client = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    const { data: auth, error: authError } =
      await client.auth.getUser(token);

    if (authError || !auth?.user) {
      return res.status(401).json({
        message: "Sesi tidak valid. Silakan login ulang.",
      });
    }

    return await handler(req, res, client, auth.user);
  } catch (error) {
    console.error("Rewards request failed:", error.name);

    return res.status(500).json({
      message: "Rewards belum dapat diproses. Coba lagi.",
    });
  }
};

// Tangani kegagalan database tanpa menampilkan detail internal.
const databaseError = (res, error) => {
  console.error("Rewards database error:", error.code);

  // Pesan validasi dari fungsi SQL penukaran.
  if (error.code === "P0001") {
    return res.status(400).json({
      message: error.message,
    });
  }

  return res.status(500).json({
    message: "Rewards belum dapat diproses. Coba lagi.",
  });
};

// Saldo, streak, dan riwayat poin masuk.
const getRewards = withAuth(async (req, res, client) => {
  const { data, error } = await client.rpc("get_reward_summary");

  if (error) return databaseError(res, error);

  return res.json({ data });
});

// Daily check-in.
const checkIn = withAuth(async (req, res, client) => {
  const { data, error } = await client.rpc("claim_daily_checkin");

  if (error) return databaseError(res, error);

  return res.json({ data });
});

// Daftar hadiah aktif, diurutkan dari harga poin terendah.
const getCatalog = withAuth(async (req, res, client) => {
  const { data, error } = await client
    .from("reward_catalog")
    .select("id, name, description, category, points_cost, stock")
    .eq("active", true)
    .order("points_cost", { ascending: true })
    .order("id", { ascending: true });

  if (error) return databaseError(res, error);

  return res.json({ data });
});

// Tukar poin menjadi voucher simulasi.
const redeemReward = withAuth(async (req, res, client) => {
  const { rewardId, requestId } = req.body || {};

  const validRewardId =
    (typeof rewardId === "number" &&
      Number.isSafeInteger(rewardId) &&
      rewardId > 0) ||
    (typeof rewardId === "string" &&
      /^[1-9]\d*$/.test(rewardId) &&
      Number.isSafeInteger(Number(rewardId)));

  const validRequestId =
    typeof requestId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      requestId
    );

  if (!validRewardId || !validRequestId) {
    return res.status(400).json({
      message: "Data penukaran tidak valid.",
    });
  }

  // Harga, saldo, stok, dan pemilik akun ditentukan database.
  const { data, error } = await client.rpc("redeem_reward", {
    p_reward_id: Number(rewardId),
    p_request_id: requestId,
  });

  if (error) return databaseError(res, error);

  return res.json({ data });
});

// Riwayat voucher milik pengguna yang sedang login.
const getVouchers = withAuth(async (req, res, client, user) => {
  const { data, error } = await client
    .from("reward_redemptions")
    .select(
      "id, reward_id, reward_name, points_spent, voucher_code, status, created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(50);

  if (error) return databaseError(res, error);

  return res.json({ data });
});

module.exports = {
  getRewards,
  checkIn,
  getCatalog,
  redeemReward,
  getVouchers,
};