import React, { useCallback, useEffect, useState } from "react";
import { Bell, Clock, Plus, Trash2, X, Loader2 } from "lucide-react";

import { reminderApi } from "../lib/api";

const INTERVAL_OPTIONS = [30, 45, 60, 90, 120];

const PERMISSION_LABEL = {
  granted: "Notifikasi aktif",
  denied: "Notifikasi diblokir browser",
  default: "Izin notifikasi belum diminta",
  unsupported: "Browser tidak mendukung notifikasi",
};

export default function Reminder({ permission, requestPermission }) {
  const [autoOn, setAutoOn] = useState(false);
  const [autoSettings, setAutoSettings] = useState({
    startTime: "07:00",
    endTime: "22:00",
    intervalMinutes: 60,
  });
  const [reminderType, setReminderType] = useState("auto");
  const [reminders, setReminders] = useState([]);
  const [newReminderTime, setNewReminderTime] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const notify = useCallback((message, tone = "success") => {
    setFeedback({ message, tone });
    setTimeout(() => setFeedback(null), 4000);
  }, []);

  const loadReminders = useCallback(async () => {
    try {
      const [list, auto] = await Promise.all([
        reminderApi.list(),
        reminderApi.getAuto(),
      ]);

      setReminders(list);
      setAutoOn(auto.enabled);
      setAutoSettings({
        startTime: auto.startTime,
        endTime: auto.endTime,
        intervalMinutes: auto.intervalMinutes,
      });
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  const saveAuto = async (payload) => {
    try {
      const auto = await reminderApi.setAuto(payload);
      setAutoOn(auto.enabled);
      setAutoSettings({
        startTime: auto.startTime,
        endTime: auto.endTime,
        intervalMinutes: auto.intervalMinutes,
      });
      return true;
    } catch (error) {
      notify(error.message, "error");
      return false;
    }
  };

  const toggleAuto = async () => {
    setSaving(true);
    await saveAuto({ enabled: !autoOn });
    setSaving(false);
  };

  const changeAutoInterval = async (intervalMinutes) => {
    setSaving(true);
    await saveAuto({ intervalMinutes });
    setSaving(false);
  };

  const changeAutoWindow = async (field, value) => {
    setSaving(true);
    await saveAuto({ [field]: value });
    setSaving(false);
  };

  const toggleReminder = async (reminder) => {
    try {
      const updated = await reminderApi.update(reminder.id, {
        enabled: !reminder.enabled,
      });
      setReminders((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (error) {
      notify(error.message, "error");
    }
  };

  const changeReminderTime = async (reminder, time) => {
    try {
      const updated = await reminderApi.update(reminder.id, { time });
      setReminders((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (error) {
      notify(error.message, "error");
    }
  };

  const addReminder = () => {
    setNewReminderTime("");
    setShowTimePicker(true);
  };

  const saveNewReminder = async () => {
    if (!newReminderTime) return;

    setSaving(true);

    try {
      const created = await reminderApi.create({
        time: newReminderTime,
        type: "custom",
      });
      setReminders((prev) => [...prev, created]);
      setNewReminderTime("");
      setShowTimePicker(false);
      notify(`Pengingat jam ${created.time} disimpan`);
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteReminder = async (reminder) => {
    try {
      await reminderApi.remove(reminder.id);
      setReminders((prev) => prev.filter((item) => item.id !== reminder.id));
      notify(`Pengingat jam ${reminder.time} dihapus`);
    } catch (error) {
      notify(error.message, "error");
    }
  };

  const showPermissionCard = permission === "default";

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        <div className="lg:col-span-3">

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-700">
                {reminderType === "auto"
                  ? "Auto Reminder Schedule"
                  : "Custom Reminder Schedule"}
              </h1>

              <p className="text-sm text-slate-400 mt-1">
                {reminderType === "auto"
                  ? "The alarm will sound every hour."
                  : "Set your own reminder times."}
              </p>
            </div>

            {reminderType === "auto" && (
              <button
                onClick={toggleAuto}
                disabled={saving}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60 ${autoOn
                    ? "bg-sky-400 text-white shadow-md shadow-sky-100"
                    : "bg-gray-200 text-gray-500"
                  }`}
              >
                {autoOn ? "Auto On" : "Auto Off"}
              </button>
            )}
          </div>

          <div
            className={`border rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${permission === "granted"
                ? "border-green-100 bg-green-50"
                : permission === "denied" || permission === "unsupported"
                  ? "border-amber-100 bg-amber-50"
                  : "border-sky-100 bg-sky-50"
              }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Bell
                className={`w-5 h-5 shrink-0 ${permission === "granted"
                    ? "text-green-500"
                    : "text-amber-500"
                  }`}
              />

              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-700">
                  {PERMISSION_LABEL[permission]}
                </p>

                <p className="text-xs text-gray-400 mt-0.5">
                  {permission === "granted"
                    ? "Alarm akan muncul dan berbunyi selama tab ini terbuka."
                    : permission === "denied" || permission === "unsupported"
                      ? "Alarm tetap muncul di dalam aplikasi, tapi notifikasi browser tidak akan muncul."
                      : "Izinkan notifikasi supaya alarm muncul walau tab tidak sedang dicek."}
                </p>
              </div>
            </div>

            {showPermissionCard && (
              <button
                onClick={requestPermission}
                className="shrink-0 px-5 py-2.5 rounded-xl bg-sky-400 text-white text-sm font-bold hover:bg-sky-500 active:scale-95 transition"
              >
                Allow
              </button>
            )}
          </div>

          {/* AUTO REMINDER */}
          {reminderType === "auto" && (
            <div
              className={`border rounded-3xl p-6 sm:p-8 transition-all ${autoOn
                  ? "border-sky-100 bg-white"
                  : "border-gray-200 bg-gray-50"
                }`}
            >
              <div className="flex flex-col sm:flex-row items-center gap-6">

                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 ${autoOn ? "bg-sky-50" : "bg-gray-100"
                    }`}
                >
                  <Bell
                    className={`w-9 h-9 ${autoOn
                        ? "text-sky-400"
                        : "text-gray-400"
                      }`}
                  />
                </div>

                <div className="text-center sm:text-left">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">
                    Automatic Schedule
                  </p>

                  <h2
                    className={`text-3xl font-extrabold mt-1 ${autoOn
                        ? "text-sky-400"
                        : "text-gray-400"
                      }`}
                  >
                    Every {autoSettings.intervalMinutes} Minutes
                  </h2>

                  <p className="text-sm text-gray-400 mt-2">
                    You will receive a reminder every {autoSettings.intervalMinutes} minutes
                    while Auto Reminder is active.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-bold mb-3">
                  Interval
                </p>

                <div className="flex flex-wrap gap-2">
                  {INTERVAL_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => changeAutoInterval(option)}
                      disabled={saving || !autoOn}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition disabled:opacity-50 ${autoSettings.intervalMinutes === option
                          ? "bg-sky-400 text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                    >
                      {option}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-sky-50/60 rounded-2xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-bold mb-2">
                    Active From
                  </p>

                  <input
                    type="time"
                    value={autoSettings.startTime}
                    disabled={!autoOn || saving}
                    onChange={(e) => changeAutoWindow("startTime", e.target.value)}
                    className="text-2xl font-extrabold text-sky-400 bg-transparent outline-none cursor-pointer disabled:opacity-50 [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                </div>

                <div className="bg-sky-50/60 rounded-2xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-bold mb-2">
                    Active Until
                  </p>

                  <input
                    type="time"
                    value={autoSettings.endTime}
                    disabled={!autoOn || saving}
                    onChange={(e) => changeAutoWindow("endTime", e.target.value)}
                    className="text-2xl font-extrabold text-sky-400 bg-transparent outline-none cursor-pointer disabled:opacity-50 [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                </div>
              </div>

              <div
                className={`mt-6 rounded-2xl p-4 flex items-center gap-3 ${autoOn ? "bg-sky-50"
                    : "bg-gray-100"
                  }`}
              >
                <Clock
                  className={`w-5 h-5 ${autoOn
                      ? "text-sky-400"
                      : "text-gray-400"
                    }`}
                />

                <p
                  className={`text-sm font-semibold ${autoOn
                      ? "text-sky-500"
                      : "text-gray-400"
                    }`}
                >
                  {autoOn
                    ? `Active every ${autoSettings.intervalMinutes} minutes, ${autoSettings.startTime} - ${autoSettings.endTime}`
                    : "Automatic reminder is turned off"}
                </p>
              </div>
            </div>
          )}

          {reminderType === "custom" && (
            <div className="flex flex-col gap-4">

              {loading && (
                <div className="flex items-center justify-center gap-3 py-16 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-semibold">Memuat pengingat...</span>
                </div>
              )}

              {!loading && reminders.length === 0 && (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
                  <Bell className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-400">
                    Belum ada pengingat custom
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Tambah jam reminder di bawah, nanti kami ingetin.
                  </p>
                </div>
              )}

              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`border rounded-2xl p-5 sm:p-6 flex items-center justify-between gap-4 transition-all ${reminder.enabled
                      ? "border-sky-100 bg-white"
                      : "border-gray-200 bg-gray-50"
                    }`}
                >

                  <div className="flex items-center gap-4 min-w-0">

                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${reminder.enabled
                          ? "bg-sky-50"
                          : "bg-gray-100"
                        }`}
                    >
                      <Clock
                        className={`w-5 h-5 ${reminder.enabled
                            ? "text-sky-400"
                            : "text-gray-400"
                          }`}
                      />
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 font-medium">
                        Reminder {reminder.id}
                      </p>

                      <input
                        type="time"
                        value={reminder.time}
                        onChange={(e) =>
                          changeReminderTime(reminder, e.target.value)
                        }
                        className={`text-2xl sm:text-3xl font-extrabold bg-transparent outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden ${reminder.enabled
                            ? "text-sky-400"
                            : "text-gray-400"
                          }`}
                      />

                      <p className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wide">
                        Everyday
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">

                    <button
                      onClick={() =>
                        toggleReminder(reminder)
                      }
                      className={`relative w-16 h-9 rounded-full shrink-0 transition-colors ${reminder.enabled
                          ? "bg-sky-400"
                          : "bg-gray-300"
                        }`}
                    >
                      <span
                        className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow-sm transition-all ${reminder.enabled
                            ? "right-1"
                            : "left-1"
                          }`}
                      />
                    </button>

                    <button
                      onClick={() =>
                        deleteReminder(reminder)
                      }
                      className="w-9 h-9 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>
                </div>
              ))}

              <button
                onClick={addReminder}
                className="w-full border-2 border-dashed border-sky-200 rounded-2xl p-5 text-sky-400 font-bold flex items-center justify-center gap-2 hover:bg-sky-50 transition"
              >
                <Plus className="w-5 h-5" />
                Add Reminder Time
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-sm">

            <h2 className="text-base font-extrabold text-slate-700 mb-5">
              Reminder Type
            </h2>

            <button
              onClick={() => setReminderType("auto")}
              className={`w-full text-left rounded-2xl p-4 border transition-all ${reminderType === "auto"
                  ? "border-sky-400 bg-sky-50"
                  : "border-transparent bg-sky-50/50 hover:bg-sky-50"
                }`}
            >
              <div className="flex items-start gap-3">

                <div
                  className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${reminderType === "auto"
                      ? "border-sky-400"
                      : "border-gray-300"
                    }`}
                >
                  {reminderType === "auto" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-sky-500">
                    Auto Reminders
                  </p>

                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    System triggers alarms automatically at a set interval
                  </p>
                </div>

              </div>
            </button>

            <button
              onClick={() => setReminderType("custom")}
              className={`w-full text-left rounded-2xl p-4 mt-3 border transition-all ${reminderType === "custom"
                  ? "border-sky-400 bg-sky-50"
                  : "border-transparent bg-sky-50/50 hover:bg-sky-50"
                }`}
            >
              <div className="flex items-start gap-3">

                <div
                  className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${reminderType === "custom"
                      ? "border-sky-400"
                      : "border-gray-300"
                    }`}
                >
                  {reminderType === "custom" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-600">
                    Custom Reminders
                  </p>

                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Manage your personal notification times manually
                  </p>
                </div>

              </div>
            </button>

          </div>
        </div>
      </div>

      {feedback && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110]">
          <div
            className={`px-5 py-3 rounded-xl shadow-lg text-sm font-bold text-white ${feedback.tone === "error"
                ? "bg-red-400"
                : "bg-sky-400"
              }`}
          >
            {feedback.message}
          </div>
        </div>
      )}

      {showTimePicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">

          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-700">
                  Add Reminder
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Choose your reminder time
                </p>
              </div>

              <button
                onClick={() => setShowTimePicker(false)}
                className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-sky-50 rounded-2xl p-7 flex flex-col items-center justify-center">

              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-4">
                <Clock className="w-7 h-7 text-sky-400" />
              </div>

              <input
                type="time"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
                className="text-4xl font-extrabold text-sky-400 bg-transparent outline-none text-center cursor-pointer appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
              />

              <p className="text-xs text-gray-400 mt-3 text-center">
                Select the time for your reminder
              </p>

            </div>

            <div className="flex gap-3 mt-6">

              <button
                onClick={() => {
                  setNewReminderTime("");
                  setShowTimePicker(false);
                }}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition"
              >
                Cancel
              </button>

              <button
                onClick={saveNewReminder}
                disabled={!newReminderTime || saving}
                className={`flex-1 py-3 rounded-xl font-bold transition ${newReminderTime
                    ? "bg-sky-400 text-white hover:bg-sky-500"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Add Reminder
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}