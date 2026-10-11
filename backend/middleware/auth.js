const supabase = require("../config/supabase");

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return res.status(401).json({
      message: "Token tidak ditemukan. Silakan login terlebih dahulu.",
    });
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({
      message: "Token tidak valid atau sudah kadaluarsa.",
    });
  }

  req.user = user;
  next();
};

module.exports = { requireAuth };
