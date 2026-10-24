const supabase = require("../config/supabase"); 
const isProdEnvironment = () =>
  process.env.NODE_ENV === "production" ||
  Boolean(process.env.CONTEXT) ||  
  process.env.NETLIFY === "true";
 
const isDevBypassEnabled = () => {
  if (isProdEnvironment()) return false;
  return process.env.DEV_AUTH_BYPASS !== "false";
};

let devUserCache = null;
 
const getDevUser = async () => {
  if (devUserCache) return devUserCache;

  const configuredId = (process.env.DEV_USER_ID || "").trim();
  if (configuredId) {
    devUserCache = { id: configuredId, email: "dev@local" };
    return devUserCache;
  }

  
  for (const table of ["drinks", "reminders", "auto_reminders"]) {
    const { data } = await supabase
      .from(table)
      .select("user_id")
      .not("user_id", "is", null)
      .limit(1);

    const found = (data || []).find((row) => row.user_id);
    if (found) {
      devUserCache = { id: found.user_id, email: "dev@local" };
      return devUserCache;
    }
  }

  return null;
};

const extractBearerToken = (req) => {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim() || null;
  }
  return null;
};

const requireAuth = async (req, res, next) => {
  const bearerToken = extractBearerToken(req);

  const queryToken =
    req.query && typeof req.query.token === "string"
      ? req.query.token.trim()
      : null;

  const token = bearerToken || queryToken;

  if (!token) {

    if (isDevBypassEnabled()) {
      const devUser = await getDevUser();

      if (!devUser) {
        return res.status(500).json({
          message:
            "DEV_AUTH_BYPASS aktif tapi user dev tidak ditemukan. Set DEV_USER_ID di .env.",
        });
      }

      req.user = devUser;
      req.authMode = "dev";
      res.setHeader?.("X-Auth-Mode", "dev-bypass");
      return next();
    }

    return res.status(401).json({
      message: "Token tidak ditemukan. Silakan login terlebih dahulu.",
      hint:
        "Kirim header 'Authorization: Bearer <token>' atau pakai ?token=<token> di URL. " +
        "Di development lokal juga boleh tanpa token (DEV_AUTH_BYPASS).",
    });
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    // Diagnosa: kenapa token ditolak (buat development).
    if (isDevBypassEnabled()) {
      console.warn(
        `[auth] token ditolak: ${error?.status || 400} ${error?.message || "user tidak ditemukan"}`
      );
    }

    // Development lokal: token basi jangan ngeblokir pengembangan.
    // Di produksi jalur ini tidak pernah dipakai.
    if (isDevBypassEnabled()) {
      const devUser = await getDevUser();
      if (devUser) {
        req.user = devUser;
        req.authMode = "dev";
        res.setHeader?.("X-Auth-Mode", "dev-bypass");
        return next();
      }
    }

    return res.status(401).json({
      message: "Token tidak valid atau sudah kadaluarsa.",
    });
  }

  req.user = user;
  req.authMode = bearerToken ? "bearer" : "query";
  res.setHeader?.("X-Auth-Mode", req.authMode);
  next();
};

module.exports = { requireAuth, isDevBypassEnabled };
