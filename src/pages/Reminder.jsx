import React, { useState } from "react";
import { Bell, CalendarDays, Clock } from "lucide-react";

export default function Reminder() {
  const [autoOn, setAutoOn] = useState(true);
  const [reminderType, setReminderType] = useState("auto");

  const [reminders, setReminders] = useState([
    { time: "6:00", period: "AM", enabled: true },
    { time: "2:00", period: "PM", enabled: true },
    { time: "5:00", period: "PM", enabled: true },
    { time: "7:00", period: "PM", enabled: true },
  ]);

  const toggleReminder = (index) => {
    setReminders((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, enabled: !item.enabled } : item
      )
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Content */}
        <div className="lg:col-span-3">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-700">
                Auto Reminder Schedule
              </h1>

              <p className="text-sm text-slate-400 mt-1">
                The alarm will sound every hour.
              </p>
            </div>

            <button
              onClick={() => setAutoOn(!autoOn)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                autoOn
                  ? "bg-sky-400 text-white shadow-md shadow-sky-100"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {autoOn ? "Auto On" : "Auto Off"}
            </button>
          </div>

          {/* Reminder List */}
          <div className="flex flex-col gap-4">
            {reminders.map((reminder, index) => (
              <div
                key={index}
                className={`border rounded-2xl p-5 sm:p-6 flex items-center justify-between gap-4 transition-all ${
                  reminder.enabled
                    ? "border-sky-100 bg-white"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                {/* Time */}
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      reminder.enabled ? "bg-sky-50" : "bg-gray-100"
                    }`}
                  >
                    <Clock
                      className={`w-5 h-5 ${
                        reminder.enabled
                          ? "text-sky-400"
                          : "text-gray-400"
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`text-2xl sm:text-3xl font-extrabold ${
                          reminder.enabled
                            ? "text-slate-700"
                            : "text-gray-400"
                        }`}
                      >
                        {reminder.time}
                      </span>

                      <span
                        className={`text-sm font-bold ${
                          reminder.enabled
                            ? "text-sky-400"
                            : "text-gray-400"
                        }`}
                      >
                        {reminder.period}
                      </span>
                    </div>

                    <p className="text-[10px] sm:text-xs text-gray-400 font-medium uppercase tracking-wide">
                      Everyday
                    </p>
                  </div>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => toggleReminder(index)}
                  className={`relative w-16 h-9 rounded-full shrink-0 transition-colors ${
                    reminder.enabled
                      ? "bg-sky-400"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow-sm transition-all ${
                      reminder.enabled ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Reminder Type */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-700 mb-5">
              Reminder Type
            </h2>

            {/* Auto */}
            <button
              onClick={() => setReminderType("auto")}
              className={`w-full text-left rounded-2xl p-4 border transition-all ${
                reminderType === "auto"
                  ? "border-sky-400 bg-sky-50"
                  : "border-transparent bg-sky-50/50 hover:bg-sky-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                    reminderType === "auto"
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

            {/* Custom */}
            <button
              onClick={() => setReminderType("custom")}
              className={`w-full text-left rounded-2xl p-4 mt-3 border transition-all ${
                reminderType === "custom"
                  ? "border-sky-400 bg-sky-50"
                  : "border-transparent bg-sky-50/50 hover:bg-sky-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                    reminderType === "custom"
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
    </div>
  );
}