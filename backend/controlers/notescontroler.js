const ICONS = ["drop", "progress", "morning", "great", "goal"];

const DEFAULT_ICON = "drop";

const seedToday = (hour, minute) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

let notes = [
  {
    id: 1,
    title: "Time to drink water!",
    message: "It's been 2 hours since your last intake. Stay hydrated!",
    icon: "drop",
    createdAt: seedToday(10, 34)
  },
  {
    id: 2,
    title: "Nice progress!",
    message: "You've reached 56% of your daily goal. Keep going!",
    icon: "progress",
    createdAt: seedToday(9, 12)
  },
  {
    id: 3,
    title: "Good morning!",
    message: "Start your day with a glass of water. Your body will thank you!",
    icon: "morning",
    createdAt: seedToday(7, 30)
  },
  {
    id: 4,
    title: "You're doing great!",
    message: "You're 75% to your daily goal. Almost there!",
    icon: "great",
    createdAt: seedToday(16, 15)
  },
  {
    id: 5,
    title: "Daily goal achieved!",
    message: "Congrats! You've reached your daily water intake target!",
    icon: "goal",
    createdAt: seedToday(20, 3)
  },
  {
    id: 6,
    title: "Don't forget!",
    message: "A little water before bed helps your body recover.",
    icon: "drop",
    createdAt: seedToday(22, 30)
  }
];

let nextId = notes.length + 1;

const isFilled = (value) => typeof value === "string" && value.trim() !== "";

const validateIcon = (icon) => ICONS.includes(icon);

const validateFields = (body, { partial }) => {
  if (!partial || body.title !== undefined) {
    if (!isFilled(body.title)) {
      return "Judul note harus diisi";
    }
  }

  if (!partial || body.message !== undefined) {
    if (!isFilled(body.message)) {
      return "Isi note harus diisi";
    }
  }

  if (body.icon !== undefined && !validateIcon(body.icon)) {
    return `Icon harus salah satu dari: ${ICONS.join(", ")}`;
  }

  return null;
};

const sortByLatest = (list) =>
  [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

// GET /api/notes
const getNotes = (req, res) => {
  res.json({
    message: "Notes berhasil diambil",
    data: sortByLatest(notes)
  });
};

// POST /api/notes
const createNote = (req, res) => {
  const { title, message, icon } = req.body;

  const invalidMessage = validateFields(req.body, { partial: false });

  if (invalidMessage) {
    return res.status(400).json({
      message: invalidMessage
    });
  }

  const note = {
    id: nextId,
    title: title.trim(),
    message: message.trim(),
    icon: icon || DEFAULT_ICON,
    createdAt: new Date().toISOString()
  };

  nextId++;
  notes.push(note);

  res.status(201).json({
    message: "Note berhasil dibuat",
    data: note
  });
};

// PUT /api/notes/:id
const updateNote = (req, res) => {
  const id = parseInt(req.params.id);
  const { title, message, icon } = req.body;

  const note = notes.find((item) => item.id === id);

  if (!note) {
    return res.status(404).json({
      message: "Note tidak ditemukan"
    });
  }

  if (title === undefined && message === undefined && icon === undefined) {
    return res.status(400).json({
      message: "Tidak ada data yang diupdate"
    });
  }

  const invalidMessage = validateFields(req.body, { partial: true });

  if (invalidMessage) {
    return res.status(400).json({
      message: invalidMessage
    });
  }

  if (title !== undefined) note.title = title.trim();
  if (message !== undefined) note.message = message.trim();
  if (icon !== undefined) note.icon = icon;

  note.updatedAt = new Date().toISOString();

  res.json({
    message: "Note berhasil diupdate",
    data: note
  });
};

// DELETE /api/notes/:id
const deleteNote = (req, res) => {
  const id = parseInt(req.params.id);

  const index = notes.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Note tidak ditemukan"
    });
  }

  const deletedNote = notes.splice(index, 1)[0];

  res.status(200).json({
    message: "Note berhasil dihapus",
    data: deletedNote
  });
};

module.exports = {
  ICONS,
  getNotes,
  createNote,
  updateNote,
  deleteNote
};