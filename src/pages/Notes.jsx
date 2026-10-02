import { useCallback, useEffect, useState } from "react";
import { Inbox, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";

import { notesApi } from "../lib/api";

import firstIcon from "../assets/firstIcon.png";
import secondIcon from "../assets/secondIcon.png";
import thirdIcon from "../assets/thirdIcon.png";
import fourIcon from "../assets/fourIcon.png";
import fiveIcon from "../assets/fiveIcon.png";

const ICON_ASSETS = {
  drop: firstIcon,
  progress: secondIcon,
  morning: thirdIcon,
  great: fourIcon,
  goal: fiveIcon,
};

const ICON_OPTIONS = [
  { value: "drop", label: "Drink" },
  { value: "progress", label: "Progress" },
  { value: "morning", label: "Morning" },
  { value: "great", label: "Great" },
  { value: "goal", label: "Goal" },
];

const EMPTY_FORM = { title: "", message: "", icon: "drop" };

const formatTime = (value) =>
  new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [form, setForm] = useState(null);

  const notify = useCallback((message, tone = "success") => {
    setFeedback({ message, tone });
    setTimeout(() => setFeedback(null), 4000);
  }, []);

  const loadNotes = useCallback(async () => {
    try {
      const data = await notesApi.list();
      setNotes(data);
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const openCreate = () => setForm({ ...EMPTY_FORM });

  const openEdit = (note) => {
    setForm({ id: note.id, title: note.title, message: note.message, icon: note.icon });
  };

  const closeForm = () => setForm(null);

  const submitForm = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      return notify("Judul dan isi note harus diisi", "error");
    }

    setSaving(true);

    try {
      const payload = {
        title: form.title,
        message: form.message,
        icon: form.icon,
      };

      if (form.id) {
        const updated = await notesApi.update(form.id, payload);
        setNotes((prev) => prev.map((note) => (note.id === updated.id ? updated : note)));
        notify("Note berhasil diupdate");
      } else {
        const created = await notesApi.create(payload);
        setNotes((prev) => [created, ...prev]);
        notify("Note berhasil dibuat");
      }

      closeForm();
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const removeNote = async (note) => {
    try {
      await notesApi.remove(note.id);
      setNotes((prev) => prev.filter((item) => item.id !== note.id));
      notify(`"${note.title}" dihapus`);
    } catch (error) {
      notify(error.message, "error");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-7">

        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
            Notifications & Notes
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Keep track of your water intake schedule and progress updates
          </p>
        </div>

        {/* ACTIVE ALERT */}
        <div className="flex items-center gap-3">

          <div
            className="
              shrink-0
              rounded-full
              bg-sky-100
              px-4
              py-2
              text-xs
              font-semibold
              text-sky-500
            "
          >
            {notes.length} Active Alerts
          </div>

          <button
            onClick={openCreate}
            className="
              shrink-0
              rounded-full
              bg-sky-400
              px-4
              py-2
              text-xs
              font-bold
              text-white
              shadow-md
              shadow-sky-100
              transition
              active:scale-95
              hover:bg-sky-500
            "
          >
            <span className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Add Note
            </span>
          </button>

        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-semibold">Memuat notes...</span>
        </div>
      )}

      {/* EMPTY */}
      {!loading && notes.length === 0 && (
        <div className="border-2 border-dashed border-slate-100 rounded-2xl p-10 text-center">
          <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-400">
            Belum ada note
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Catat pengingat atau progres minum kamu di sini.
          </p>
        </div>
      )}

      {/* NOTE CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {notes.map((note) => (
          <div
            key={note.id}
            className="
              flex
              items-center
              gap-5
              min-h-[125px]
              rounded-2xl
              border
              border-slate-100
              bg-white
              p-5
              shadow-sm
              transition
              duration-200
              hover:shadow-md
            "
          >

            {/* ICON BOX */}
            <div
              className="
                flex
                h-[72px]
                w-[72px]
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#EAF7FF]
              "
            >
              <img
                src={ICON_ASSETS[note.icon] || ICON_ASSETS.drop}
                alt={note.title}
                className="
                  h-[52px]
                  w-[52px]
                  object-contain
                "
              />
            </div>

            {/* CONTENT */}
            <div className="min-w-0 flex-1">

              {/* TITLE + TIME */}
              <div className="flex items-start justify-between gap-3">

                <h2
                  className="
                    text-sm
                    md:text-base
                    font-bold
                    text-[#35A7F5]
                  "
                >
                  {note.title}
                </h2>

                <span
                  className="
                    shrink-0
                    text-[10px]
                    font-medium
                    text-slate-300
                  "
                >
                  {formatTime(note.createdAt)}
                </span>

              </div>

              {/* MESSAGE */}
              <p
                className="
                  mt-2
                  text-xs
                  md:text-sm
                  leading-5
                  text-slate-500
                "
              >
                {note.message}
              </p>

              {/* ACTIONS */}
              <div className="mt-3 flex items-center gap-2">

                <button
                  onClick={() => openEdit(note)}
                  aria-label={`Edit ${note.title}`}
                  className="
                    w-8
                    h-8
                    rounded-lg
                    bg-sky-50
                    text-sky-400
                    flex
                    items-center
                    justify-center
                    hover:bg-sky-100
                    transition
                  "
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => removeNote(note)}
                  aria-label={`Hapus ${note.title}`}
                  className="
                    w-8
                    h-8
                    rounded-lg
                    bg-red-50
                    text-red-400
                    flex
                    items-center
                    justify-center
                    hover:bg-red-100
                    transition
                  "
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

              </div>

            </div>
          </div>
        ))}

      </div>

      {/* FEEDBACK */}
      {feedback && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110]">
          <div
            className={`
              px-5
              py-3
              rounded-xl
              shadow-lg
              text-sm
              font-bold
              text-white
              ${feedback.tone === "error" ? "bg-red-400" : "bg-sky-400"}
            `}
          >
            {feedback.message}
          </div>
        </div>
      )}

      {/* FORM MODAL */}
      {form && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">

          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">

            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-extrabold text-slate-700">
                  {form.id ? "Edit Note" : "Add Note"}
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  {form.id
                    ? "Ubah isi note ini"
                    : "Simpan catatan pengingat atau progres"}
                </p>
              </div>

              <button
                onClick={closeForm}
                aria-label="Tutup"
                className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Judul
                </label>

                <input
                  type="text"
                  value={form.title}
                  maxLength={60}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Time to drink water!"
                  className="w-full px-4 py-3 rounded-xl bg-sky-50 outline-none text-sm text-slate-700 placeholder:text-slate-300 focus:bg-sky-100 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Isi note
                </label>

                <textarea
                  value={form.message}
                  rows={4}
                  maxLength={200}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, message: e.target.value }))
                  }
                  placeholder="It's been 2 hours since your last intake."
                  className="w-full px-4 py-3 rounded-xl bg-sky-50 outline-none text-sm text-slate-700 placeholder:text-slate-300 focus:bg-sky-100 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Icon
                </label>

                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, icon: option.value }))
                      }
                      className={`
                        w-11
                        h-11
                        rounded-xl
                        border
                        flex
                        items-center
                        justify-center
                        transition
                        ${form.icon === option.value
                          ? "border-sky-400 bg-sky-50"
                          : "border-transparent bg-sky-50/50 hover:bg-sky-50"
                        }
                      `}
                    >
                      <img
                        src={ICON_ASSETS[option.value]}
                        alt={option.label}
                        className="h-8 w-8 object-contain"
                      />
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="flex gap-3 mt-6">

              <button
                onClick={closeForm}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition"
              >
                Cancel
              </button>

              <button
                onClick={submitForm}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-sky-400 text-white font-bold hover:bg-sky-500 active:scale-95 transition disabled:opacity-60"
              >
                <span className="flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {form.id ? "Save Changes" : "Add Note"}
                </span>
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Notes;