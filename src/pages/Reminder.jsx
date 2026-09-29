import React, { useState } from "react";
import { Bell, Clock, Plus, Trash2, X } from "lucide-react";

export default function Reminder() {
  const [autoOn, setAutoOn] = useState(true);
  const [reminderType, setReminderType] = useState("auto");

  const [reminders, setReminders] = useState([
    { time: "06:00", enabled: true },
    { time: "14:00", enabled: true },
    { time: "17:00", enabled: true },
    { time: "19:00", enabled: true },
  ]);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newReminderTime, setNewReminderTime] = useState("");

  const toggleReminder = (index) => {
    setReminders((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, enabled: !item.enabled }
          : item
      )
    );
  };

  const changeReminderTime = (index, newTime) => {
    setReminders((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, time: newTime }
          : item
      )
    );
  };

  const addReminder = () => {
    setNewReminderTime("");
    setShowTimePicker(true);
  };

  const saveNewReminder = () => {
    if (!newReminderTime) return;

    setReminders((prev) => [
      ...prev,
      {
        time: newReminderTime,
        enabled: true,
      },
    ]);

    setNewReminderTime("");
    setShowTimePicker(false);
  };

  const deleteReminder = (index) => {
    setReminders((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* LEFT CONTENT */}
        <div className="lg:col-span-3">

          {/* HEADER */}
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
                onClick={() => setAutoOn(!autoOn)}
                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${autoOn
                    ? "bg-sky-400 text-white shadow-md shadow-sky-100"
                    : "bg-gray-200 text-gray-500"
                  }`}
              >
                {autoOn ? "Auto On" : "Auto Off"}
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
                    Every 1 Hour
                  </h2>

                  <p className="text-sm text-gray-400 mt-2">
                    You will receive a reminder every hour
                    while Auto Reminder is active.
                  </p>
                </div>
              </div>

              <div
                className={`mt-6 rounded-2xl p-4 flex items-center gap-3 ${autoOn ? "bg-sky-50" : "bg-gray-100"
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
                    ? "Automatic reminder is active"
                    : "Automatic reminder is turned off"}
                </p>
              </div>
            </div>
          )}

          {/* CUSTOM REMINDER */}
          {reminderType === "custom" && (
            <div className="flex flex-col gap-4">

              {reminders.map((reminder, index) => (
                <div
                  key={index}
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
                        Reminder {index + 1}
                      </p>

                      <input
                        type="time"
                        value={reminder.time}
                        onChange={(e) =>
                          changeReminderTime(
                            index,
                            e.target.value
                          )
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
                        toggleReminder(index)
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
                        deleteReminder(index)
                      }
                      className="w-9 h-9 rounded-xl bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>
                </div>
              ))}

              {/* ADD REMINDER */}
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

        {/* REMINDER TYPE */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-sm">

            <h2 className="text-base font-extrabold text-slate-700 mb-5">
              Reminder Type
            </h2>

            {/* AUTO */}
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
                    System triggers alarms automatically every 1 hour
                  </p>
                </div>

              </div>
            </button>

            {/* CUSTOM */}
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

      {/* TIME PICKER MODAL */}
      {showTimePicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">

          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">

            {/* HEADER */}
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

            {/* TIME PICKER */}
            <div className="bg-sky-50 rounded-2xl p-7 flex flex-col items-center justify-center">

              {/* CLOCK ICON - CENTER */}
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

            {/* BUTTONS */}
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
                disabled={!newReminderTime}
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