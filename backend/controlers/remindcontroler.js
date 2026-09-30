let reminders = [];
let nextId = 1;

const HISTORY_LIMIT = 50;

let firedHistory = [];

let autoReminder = {
  enabled: false,
  startTime: "07:00",
  endTime: "22:00",
  intervalMinutes: 60,
  lastFiredAt: null
};

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const isValidTime = (value) =>
  typeof value === "string" && TIME_PATTERN.test(value);

const toMinutes = (time) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const minutesNow = (date) => date.getHours() * 60 + date.getMinutes();

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const toSlot = (date, intervalMinutes) =>
  Math.floor(minutesNow(date) / intervalMinutes);

const isCustomDue = (reminder, now) => {
  if (!reminder.enabled) return false;

  if (reminder.lastFiredAt) {
    const last = new Date(reminder.lastFiredAt);
    if (!isNaN(last) && isSameDay(last, now)) return false;
  }

  return minutesNow(now) >= toMinutes(reminder.time);
};

const isAutoDue = (now) => {
  if (!autoReminder.enabled) return false;

  const current = minutesNow(now);
  if (current < toMinutes(autoReminder.startTime)) return false;
  if (current > toMinutes(autoReminder.endTime)) return false;

  if (autoReminder.lastFiredAt) {
    const last = new Date(autoReminder.lastFiredAt);
    if (!isNaN(last) && isSameDay(last, now)) {
      return toSlot(now, autoReminder.intervalMinutes) >
        toSlot(last, autoReminder.intervalMinutes);
    }
  }

  return true;
};

const pushHistory = (entry) => {
  firedHistory.push(entry);
  if (firedHistory.length > HISTORY_LIMIT) {
    firedHistory = firedHistory.slice(-HISTORY_LIMIT);
  }
};

const getReminders = (req, res) => {
  res.json({
    data: reminders
  });
};

const createReminder = (req, res) => {
  const { time, enabled, type } = req.body;

  if (!time) {
    return res.status(400).json({
      message: "Waktu pengingat harus diisi"
    });
  }

  if (!isValidTime(time)) {
    return res.status(400).json({
      message: "Format waktu harus HH:MM, contoh 10:00"
    });
  }

  if (type && type !== "auto" && type !== "custom") {
    return res.status(400).json({
      message: "Tipe reminder harus auto atau custom"
    });
  }

  const reminder = {
    id: nextId,
    time: time,
    enabled: enabled !== undefined ? enabled : true,
    type: type || "custom",
    lastFiredAt: null,
    createdAt: new Date().toISOString()
  };

  nextId++;
  reminders.push(reminder);

  res.status(201).json({
    message: "Pengingat Successfully dibuat",
    data: reminder
  });
};

const updateReminder = (req, res) => {
  const id = parseInt(req.params.id);
  const { time, enabled, type } = req.body;

  const reminder = reminders.find((r) => r.id === id);

  if (!reminder) {
    return res.status(404).json({
      message: "Pengingat tidak ditemukan"
    });
  }

  if (time !== undefined) {
    if (!isValidTime(time)) {
      return res.status(400).json({
        message: "Format waktu harus HH:MM, contoh 10:00"
      });
    }
    reminder.time = time;
    reminder.lastFiredAt = null;
  }

  if (enabled !== undefined) reminder.enabled = enabled;
  if (type !== undefined) {
    if (type !== "auto" && type !== "custom") {
      return res.status(400).json({
        message: "Tipe reminder harus auto atau custom"
      });
    }
    reminder.type = type;
  }

  res.json({
    message: "Pengingat Successfully diupdate",
    data: reminder
  });
};

const deleteReminder = (req, res) => {
  const id = parseInt(req.params.id);

  const index = reminders.findIndex((r) => r.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Pengingat tidak ditemukan"
    });
  }

  const deletedReminder = reminders.splice(index, 1);

  res.status(200).json({
    message: "Pengingat Successfully dihapus",
    data: deletedReminder[0]
  });
};

const getAutoReminder = (req, res) => {
  res.json({
    data: autoReminder
  });
};

const updateAutoReminder = (req, res) => {
  const { enabled, startTime, endTime, intervalMinutes } = req.body;

  if (startTime !== undefined || endTime !== undefined) {
    const nextStart = startTime !== undefined ? startTime : autoReminder.startTime;
    const nextEnd = endTime !== undefined ? endTime : autoReminder.endTime;

    if (!isValidTime(nextStart) || !isValidTime(nextEnd)) {
      return res.status(400).json({
        message: "Format waktu harus HH:MM, contoh 08:00"
      });
    }

    if (toMinutes(nextStart) >= toMinutes(nextEnd)) {
      return res.status(400).json({
        message: "Jam mulai harus lebih dulu dari jam selesai"
      });
    }
  }

  if (enabled !== undefined) autoReminder.enabled = enabled;
  if (startTime !== undefined) autoReminder.startTime = startTime;
  if (endTime !== undefined) autoReminder.endTime = endTime;

  if (intervalMinutes !== undefined) {
    const interval = Number(intervalMinutes);

    if (!Number.isFinite(interval) || interval < 15 || interval > 240) {
      return res.status(400).json({
        message: "Interval harus antara 15 sampai 240 menit"
      });
    }

    autoReminder.intervalMinutes = interval;
  }

  autoReminder.lastFiredAt = null;

  res.json({
    message: "Auto reminder Successfully diupdate",
    data: autoReminder
  });
};

const getDueReminders = (req, res) => {
  const now = new Date();
  const due = [];

  reminders.forEach((reminder) => {
    if (!isCustomDue(reminder, now)) return;

    reminder.lastFiredAt = now.toISOString();

    due.push({
      id: reminder.id,
      source: "custom",
      time: reminder.time,
      title: "Waktunya minum",
      message: "Sudah waktunya minum air ya, jangan sampai dehidrasi."
    });
  });

  if (isAutoDue(now)) {
    autoReminder.lastFiredAt = now.toISOString();

    due.push({
      id: null,
      source: "auto",
      time: now.toTimeString().slice(0, 5),
      title: "Waktunya minum",
      message: `Auto reminder: DUI setiap ${autoReminder.intervalMinutes} menit antara ${autoReminder.startTime} - ${autoReminder.endTime}.`
    });
  }

  due.forEach((item) => {
    pushHistory({
      id: item.id,
      source: item.source,
      time: item.time,
      title: item.title,
      message: item.message,
      firedAt: now.toISOString()
    });
  });

  res.json({
    message: "Pengingat yang siap dikirim",
    data: {
      dueCount: due.length,
      checkedAt: now.toISOString(),
      reminders: due
    }
  });
};

const getHistory = (req, res) => {
  res.json({
    data: [...firedHistory].reverse()
  });
};

const resetReminderFired = (req, res) => {
  const id = parseInt(req.params.id);

  if (id === 0) {
    autoReminder.lastFiredAt = null;
    return res.json({
      message: "Status auto reminder berhasil direset",
      data: autoReminder
    });
  }

  const reminder = reminders.find((r) => r.id === id);

  if (!reminder) {
    return res.status(404).json({
      message: "Pengingat tidak ditemukan"
    });
  }

  reminder.lastFiredAt = null;

  res.json({
    message: "Status pengingat berhasil direset",
    data: reminder
  });
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
  resetReminderFired
};
