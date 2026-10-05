import { useCallback, useEffect, useState } from "react";
import { Loader2, X, CheckCheck } from "lucide-react";

import { notesApi } from "../lib/api";

import firstIcon from "../assets/Exit.png";
import secondIcon from "../assets/secondIcon.png";
import thirdIcon from "../assets/firstIcon.png";
import fourIcon from "../assets/fourIcon.png";
import fiveIcon from "../assets/logo.png";

const ICON_ASSETS = {
  drop: firstIcon,
  progress: secondIcon,
  morning: thirdIcon,
  great: fourIcon,
  goal: fiveIcon,
};

const formatTime = (value) =>
  new Date(value).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [popup, setPopup] = useState(null);

  const notify = useCallback((message, tone = "success") => {
    setFeedback({ message, tone });

    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  }, []);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);

      const savedGoal = Number(localStorage.getItem("waterGoal"));
      const goal = savedGoal > 0 ? savedGoal : 2000;

      const data = await notesApi.list(goal);

      // Tambahkan default field isRead jika belum ada dari API
      const formattedData = data.map((item) => ({
        ...item,
        isRead: item.isRead ?? false,
      }));

      setNotes(formattedData);

      // Popup notification cuma muncul 1 kali per hari
      const today = new Date().toISOString().split("T")[0];
      const popupDate = localStorage.getItem("notificationPopupDate");

      if (formattedData.length > 0 && popupDate !== today) {
        setPopup(formattedData[0]);
        localStorage.setItem("notificationPopupDate", today);
      }
    } catch (error) {
      console.error("Gagal mengambil notification:", error);
      notify(error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Tandai 1 pesan sebagai sudah dibaca saat diklik
  const handleMarkAsRead = (id) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, isRead: true } : note
      )
    );
  };

  // Tandai semua pesan sebagai sudah dibaca
  const handleMarkAllAsRead = () => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => ({ ...note, isRead: true }))
    );
  };

  const closePopup = () => {
    setPopup(null);
  };

  // Hitung berapa banyak pesan yang belum dibaca
  const unreadCount = notes.filter((n) => !n.isRead).length;

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Keep track of your water intake schedule and progress updates
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* BADGE UNREAD */}
          <div className="shrink-0 rounded-full bg-sky-100 px-4 py-2 text-xs font-semibold text-sky-500">
            {unreadCount} Unread Alerts
          </div>

          {/* TOMBOL MARK ALL AS READ */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 text-xs font-semibold text-sky-500 hover:text-sky-600 transition"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-semibold">
            Loading notifications...
          </span>
        </div>
      )}

      {/* EMPTY */}
      {!loading && notes.length === 0 && (
        <div className="border-2 border-dashed border-slate-100 rounded-2xl p-10 text-center">
          <img
            src={ICON_ASSETS.drop}
            alt="Water"
            className="w-16 h-16 object-contain mx-auto mb-3"
          />
          <p className="text-sm font-bold text-slate-400">
            No notification yet
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Notification will appear based on your drinking progress.
          </p>
        </div>
      )}

      {/* NOTIFICATION CARDS */}
      {!loading && notes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {notes.map((note) => {
            const isUnread = !note.isRead;

            return (
              <div
                key={note.id}
                onClick={() => isUnread && handleMarkAsRead(note.id)}
                className={`relative flex items-center gap-5 min-h-[125px] rounded-2xl border p-5 shadow-sm transition duration-200 cursor-pointer ${
                  isUnread
                    ? "bg-sky-50/40 border-sky-200 hover:shadow-md"
                    : "bg-white border-slate-100 hover:shadow-md"
                }`}
              >
                {/* INDIKATOR DOT BIRU UNTUK UNREAD */}
                {isUnread && (
                  <span className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-sky-500 ring-4 ring-sky-100" />
                )}

                {/* ICON */}
                <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-xl bg-[#EAF7FF]">
                  <img
                    src={ICON_ASSETS[note.icon] || ICON_ASSETS.drop}
                    alt={note.title}
                    className="h-[52px] w-[52px] object-contain"
                  />
                </div>

                {/* CONTENT */}
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-start justify-between gap-3">
                    <h2
                      className={`text-sm md:text-base ${
                        isUnread
                          ? "font-extrabold text-sky-600"
                          : "font-bold text-[#35A7F5]"
                      }`}
                    >
                      {note.title}
                    </h2>

                    <span className="shrink-0 text-[10px] font-medium text-slate-300">
                      {formatTime(note.createdAt)}
                    </span>
                  </div>

                  <p className="mt-2 text-xs md:text-sm leading-5 text-slate-500">
                    {note.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* POPUP NOTIFICATION */}
      {popup && (
        <div className="fixed top-6 right-6 z-[200] w-[360px] max-w-[calc(100vw-32px)]">
          <div className="relative flex gap-4 rounded-2xl border border-sky-100 bg-white p-4 shadow-2xl animate-[slideIn_.3s_ease-out]">
            {/* CLOSE */}
            <button
              onClick={closePopup}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            {/* ICON */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#EAF7FF]">
              <img
                src={ICON_ASSETS[popup.icon] || ICON_ASSETS.drop}
                alt={popup.title}
                className="h-12 w-12 object-contain"
              />
            </div>

            {/* TEXT */}
            <div className="pr-5">
              <p className="text-[11px] font-semibold text-sky-400">
                HYDRATE REMINDER
              </p>
              <h3 className="mt-1 text-sm font-extrabold text-slate-700">
                {popup.title}
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {popup.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK */}
      {feedback && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[210]">
          <div
            className={`px-5 py-3 rounded-xl shadow-lg text-sm font-bold text-white ${
              feedback.tone === "error" ? "bg-red-400" : "bg-sky-400"
            }`}
          >
            {feedback.message}
          </div>
        </div>
      )}
    </div>
  );
}

export default Notes;