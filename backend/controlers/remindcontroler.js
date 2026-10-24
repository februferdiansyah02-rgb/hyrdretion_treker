const supabase = require("../config/supabase");

// ============================================================
// Bagian 1: helper kecil seputar waktu
// ============================================================

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/; // format "HH:MM"

// Cek apakah string waktunya benar, contoh "07:30".
const isValidTime = (value) =>
  typeof value === "string" && TIME_PATTERN.test(value);

// Ubah "07:30" jadi jumlah menit (7*60 + 30 = 450).
const toMinutes = (time) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

// Ubah jam sekarang jadi jumlah menit.
const minutesNow = (date) => date.getHours() * 60 + date.getMinutes();

// Cek apakah dua tanggal jatuh di hari yang sama.
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// Pembagian waktu jadi slot (dipakai auto reminder).
const toSlot = (date, intervalMinutes) =>
  Math.floor(minutesNow(date) / intervalMinutes);

// Setting default auto reminder (kalau user belum pernah atur).
const DEFAULT_AUTO = {
  enabled: false,
  startTime: "07:00",
  endTime: "22:00",
  intervalMinutes: 60,
  lastFiredAt: null,
};

// ============================================================
// Bagian 2: ubah baris DB (snake_case) <-> format API (camelCase)
// ============================================================

const toReminder = (row) => ({
  id: row.id,
  time: row.time,
  enabled: row.enabled,
  type: row.type,
  lastFiredAt: row.last_fired_at,
  createdAt: row.created_at,
});

const toAuto = (row) => ({
  enabled: row.enabled,
  startTime: row.start_time,
  endTime: row.end_time,
  intervalMinutes: row.interval_minutes,
  lastFiredAt: row.last_fired_at,
});

// ============================================================
// Bagian 3: aturan kapan reminder dianggap "waktunya bunyi"
// ============================================================

// Reminder custom: aktif, belum bunyi hari ini, dan jamnya sudah lewat.
const isCustomDue = (reminder, now) => {
  if (!reminder.enabled) return false;

  if (reminder.lastFiredAt) {
    const last = new Date(reminder.lastFiredAt);
    if (!isNaN(last) && isSameDay(last, now)) return false;
  }

  return minutesNow(now) >= toMinutes(reminder.time);
};

// Auto reminder: aktif, dalam rentang jam, dan sudah lewat 1 interval.
const isAutoDue = (auto, now) => {
  if (!auto.enabled) return false;

  const current = minutesNow(now);
  if (current < toMinutes(auto.startTime)) return false;
  if (current > toMinutes(auto.endTime)) return false;

  if (auto.lastFiredAt) {
    const last = new Date(auto.lastFiredAt);
    if (!isNaN(last) && isSameDay(last, now)) {
      return toSlot(now, auto.intervalMinutes) > toSlot(last, auto.intervalMinutes);
    }
  }

  return true;
};

// ============================================================
// Bagian 4: pengingat custom (CRUD)
// ============================================================

// GET /api/reminders
const getReminders = async (req, res) => {
  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", req.user.id)
    .order("time", { ascending: true });

  if (error) return res.status(500).json({ message: error.message });

  res.json({ data: (data || []).map(toReminder) });
};

// POST /api/reminders
const createReminder = async (req, res) => {
  const { time, enabled, type } = req.body;

  if (!time) return res.status(400).json({ message: "Waktu pengingat harus diisi" });
  if (!isValidTime(time)) {
    return res.status(400).json({ message: "Format waktu harus HH:MM, contoh 10:00" });
  }
  if (type && type !== "auto" && type !== "custom") {
    return res.status(400).json({ message: "Tipe reminder harus auto atau custom" });
  }

  const { data, error } = await supabase
    .from("reminders")
    .insert([
      {
        user_id: req.user.id,
        time,
        enabled: enabled !== undefined ? enabled : true,
        type: type || "custom",
      },
    ])
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });

  res.status(201).json({ message: "Pengingat berhasil dibuat", data: toReminder(data) });
};

// PUT /api/reminders/:id
const updateReminder = async (req, res) => {
  const id = Number(req.params.id);
  const { time, enabled, type } = req.body;

  // Kumpulkan hanya field yang dikirim.
  const updates = {};

  if (time !== undefined) {
    if (!isValidTime(time)) {
      return res.status(400).json({ message: "Format waktu harus HH:MM, contoh 10:00" });
    }
    updates.time = time;
    updates.last_fired_at = null; // reset biar bisa bunyi lagi
  }

  if (enabled !== undefined) updates.enabled = enabled;

  if (type !== undefined) {
    if (type !== "auto" && type !== "custom") {
      return res.status(400).json({ message: "Tipe reminder harus auto atau custom" });
    }
    updates.type = type;
  }

  const { data, error } = await supabase
    .from("reminders")
    .update(updates)
    .eq("id", id)
    .eq("user_id", req.user.id)
    .select()
    .maybeSingle();

  if (error) return res.status(500).json({ message: error.message });
  if (!data) return res.status(404).json({ message: "Pengingat tidak ditemukan" });

  res.json({ message: "Pengingat berhasil diupdate", data: toReminder(data) });
};

// DELETE /api/reminders/:id
const deleteReminder = async (req, res) => {
  const id = Number(req.params.id);

  const { data, error } = await supabase
    .from("reminders")
    .delete()
    .eq("id", id)
    .eq("user_id", req.user.id)
    .select()
    .maybeSingle();

  if (error) return res.status(500).json({ message: error.message });
  if (!data) return res.status(404).json({ message: "Pengingat tidak ditemukan" });

  res.status(200).json({ message: "Pengingat berhasil dihapus", data: toReminder(data) });
};

// ============================================================
// Bagian 5: auto reminder
// ============================================================

// GET /api/reminders/auto
const getAutoReminder = async (req, res) => {
  const { data, error } = await supabase
    .from("auto_reminders")
    .select("*")
    .eq("user_id", req.user.id)
    .maybeSingle();

  if (error) return res.status(500).json({ message: error.message });

  // Kalau belum pernah diatur, kirim default.
  res.json({ data: data ? toAuto(data) : DEFAULT_AUTO });
};

// PUT /api/reminders/auto
const updateAutoReminder = async (req, res) => {
  const { enabled, startTime, endTime, intervalMinutes } = req.body;

  // Ambil setting sekarang sebagai dasar (kalau ada).
  const { data: current } = await supabase
    .from("auto_reminders")
    .select("*")
    .eq("user_id", req.user.id)
    .maybeSingle();

  // Gabungkan nilai lama + nilai baru.
  const next = {
    enabled: enabled !== undefined ? enabled : current?.enabled ?? DEFAULT_AUTO.enabled,
    startTime: startTime !== undefined ? startTime : current?.start_time ?? DEFAULT_AUTO.startTime,
    endTime: endTime !== undefined ? endTime : current?.end_time ?? DEFAULT_AUTO.endTime,
    intervalMinutes:
      intervalMinutes !== undefined
        ? Number(intervalMinutes)
        : current?.interval_minutes ?? DEFAULT_AUTO.intervalMinutes,
  };

  // Validasi.
  if (!isValidTime(next.startTime) || !isValidTime(next.endTime)) {
    return res.status(400).json({ message: "Format waktu harus HH:MM, contoh 08:00" });
  }
  if (toMinutes(next.startTime) >= toMinutes(next.endTime)) {
    return res.status(400).json({ message: "Jam mulai harus lebih dulu dari jam selesai" });
  }
  if (!Number.isFinite(next.intervalMinutes) || next.intervalMinutes < 15 || next.intervalMinutes > 240) {
    return res.status(400).json({ message: "Interval harus antara 15 sampai 240 menit" });
  }

  // Simpan (insert kalau belum ada, update kalau sudah ada).
  const { data, error } = await supabase
    .from("auto_reminders")
    .upsert({
      user_id: req.user.id,
      enabled: next.enabled,
      start_time: next.startTime,
      end_time: next.endTime,
      interval_minutes: next.intervalMinutes,
      last_fired_at: null,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ message: error.message });

  res.json({ message: "Auto reminder berhasil diupdate", data: toAuto(data) });
};

// ============================================================
// Bagian 6: cek reminder yang waktunya bunyi + riwayat
// ============================================================

// GET /api/reminders/due
const getDueReminders = async (req, res) => {
  const now = new Date();

  // Ambil reminder custom yang aktif.
  const { data: rows, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", req.user.id)
    .eq("enabled", true);

  if (error) return res.status(500).json({ message: error.message });

  // Ambil setting auto reminder.
  const { data: autoRow } = await supabase
    .from("auto_reminders")
    .select("*")
    .eq("user_id", req.user.id)
    .maybeSingle();

  const due = [];

  // Cari reminder custom yang sudah waktunya.
  for (const row of rows || []) {
    if (!isCustomDue(toReminder(row), now)) continue;

    // Tandai sudah bunyi hari ini.
    await supabase
      .from("reminders")
      .update({ last_fired_at: now.toISOString() })
      .eq("id", row.id)
      .eq("user_id", req.user.id);

    due.push({
      id: row.id,
      source: "custom",
      time: row.time,
      title: "Waktunya minum",
      message: "Sudah waktunya minum air ya, jangan sampai dehidrasi.",
    });
  }

  // Cek auto reminder.
  const auto = autoRow ? toAuto(autoRow) : DEFAULT_AUTO;

  if (isAutoDue(auto, now)) {
    await supabase
      .from("auto_reminders")
      .update({ last_fired_at: now.toISOString() })
      .eq("user_id", req.user.id);

    due.push({
      id: null,
      source: "auto",
      time: now.toTimeString().slice(0, 5),
      title: "Waktunya minum",
      message: `Auto reminder: minum setiap ${auto.intervalMinutes} menit antara ${auto.startTime} - ${auto.endTime}.`,
    });
  }

  // Simpan yang bunyi ke riwayat.
  if (due.length > 0) {
    await supabase.from("reminder_history").insert(
      due.map((item) => ({
        user_id: req.user.id,
        source: item.source,
        time: item.time,
        title: item.title,
        message: item.message,
        fired_at: now.toISOString(),
      }))
    );
  }

  res.json({
    message: "Pengingat yang siap dikirim",
    data: { dueCount: due.length, checkedAt: now.toISOString(), reminders: due },
  });
};

// GET /api/reminders/history
const getHistory = async (req, res) => {
  const { data, error } = await supabase
    .from("reminder_history")
    .select("*")
    .eq("user_id", req.user.id)
    .order("fired_at", { ascending: false })
    .limit(50);

  if (error) return res.status(500).json({ message: error.message });

  res.json({
    data: (data || []).map((row) => ({
      id: row.id,
      source: row.source,
      time: row.time,
      title: row.title,
      message: row.message,
      firedAt: row.fired_at,
    })),
  });
};
 
const resetReminderFired = async (req, res) => {
  const id = Number(req.params.id);

  if (id === 0) {
    const { data, error } = await supabase
      .from("auto_reminders")
      .update({ last_fired_at: null })
      .eq("user_id", req.user.id)
      .select()
      .maybeSingle();

    if (error) return res.status(500).json({ message: error.message });

    return res.json({
      message: "Status auto reminder berhasil direset",
      data: data ? toAuto(data) : DEFAULT_AUTO,
    });
  }

  const { data, error } = await supabase
    .from("reminders")
    .update({ last_fired_at: null })
    .eq("id", id)
    .eq("user_id", req.user.id)
    .select()
    .maybeSingle();

  if (error) return res.status(500).json({ message: error.message });
  if (!data) return res.status(404).json({ message: "Pengingat tidak ditemukan" });

  res.json({ message: "Status pengingat berhasil direset", data: toReminder(data) });
};

module.exports = {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  getAutoReminder,
  updateAutoReminder,
  getDueReminders,
  getHistory,
  resetReminderFired,
};
