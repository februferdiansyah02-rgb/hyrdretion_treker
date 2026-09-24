import React, { useState, useEffect } from "react";
import { Droplet, Plus } from "lucide-react";
import logo from "../assets/logo.png";

export default function HomePage({ onAddWater, totalWater = 500 }) {
  const [userName, setUserName] = useState("Mayonggg");
  const [goal, setGoal] = useState(2000);
  const [customAmount, setCustomAmount] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    const savedGoal = localStorage.getItem("waterGoal");

    if (savedName) setUserName(savedName);
    if (savedGoal) setGoal(Number(savedGoal));
  }, []);

  const quickAddOptions = [
    { label: "250 ML", value: 250 },
    { label: "500 ML", value: 500 },
    { label: "700 ML", value: 700 },
    { label: "1 L", value: 1000 },
  ];

  const progress = Math.min((totalWater / goal) * 100, 100);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progressOffset =
    circumference - (progress / 100) * circumference;

  const handleGoal = () => {
    const newGoal = window.prompt(
      "Masukkan target air harian (ml):",
      goal
    );

    if (!newGoal) return;

    const parsedGoal = Number(newGoal);

    if (!Number.isNaN(parsedGoal) && parsedGoal > 0) {
      setGoal(parsedGoal);
      localStorage.setItem("waterGoal", parsedGoal);
    }
  };

  const handleCustomWater = () => {
    const amount = Number(customAmount);

    if (!amount || amount <= 0) return;

    if (onAddWater) {
      onAddWater(amount);
    }

    setCustomAmount("");
    setShowCustom(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Greeting */}
      <div className="mb-6">
        <p className="text-gray-400 font-semibold text-sm sm:text-base">
          Good afternoon
        </p>

        <h1 className="text-sky-400 font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight">
          {userName}
        </h1>
      </div>

      {/* Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-start">
        {/* Left */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Reminder Card */}
          <div className="relative w-full min-h-[220px] sm:min-h-[240px] rounded-3xl overflow-hidden bg-sky-400 p-5 sm:p-7 shadow-lg shadow-sky-100">
            <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/10" />
            <div className="absolute -left-20 -bottom-20 w-56 h-56 rounded-full bg-white/10" />

            <div className="relative z-10 max-w-[55%] sm:max-w-[60%]">
              <span className="inline-block bg-white/90 text-sky-500 px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                11:00 AM
              </span>

              <h2 className="text-white font-extrabold text-2xl sm:text-3xl mt-4 leading-tight">
                Don't forget
                <br />
                to drink!
              </h2>

              <p className="text-white/80 text-xs sm:text-sm mt-2">
                Stay hydrated and keep your body healthy.
              </p>

              <button
                onClick={handleGoal}
                className="mt-5 bg-white text-sky-500 font-bold px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm shadow-md hover:bg-sky-50 active:scale-95 transition-all"
              >
                Set Your Goal
              </button>
            </div>

            <img
              src={logo}
              alt="Water Character"
              className="absolute right-0 bottom-0 w-36 h-36 sm:w-48 sm:h-48 lg:w-52 lg:h-52 object-contain z-10"
            />
          </div>

          {/* Add Water Header */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
              Add Water Intake
            </h2>

            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Choose how much water you drank
            </p>
          </div>

          {/* Quick Add */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            {quickAddOptions.map((item) => (
              <button
                key={item.value}
                onClick={() =>
                  onAddWater && onAddWater(item.value)
                }
                className="bg-white border border-sky-100 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2 min-h-[110px] shadow-sm hover:border-sky-300 hover:shadow-md active:scale-95 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                  <Droplet className="w-6 h-6 text-sky-400 fill-sky-400 group-hover:scale-110 transition-transform" />
                </div>

                <span className="text-sky-500 font-bold text-xs sm:text-sm">
                  {item.label}
                </span>
              </button>
            ))}

            {/* Custom */}
            <button
              onClick={() => setShowCustom(true)}
              className="bg-white border border-dashed border-sky-300 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2 min-h-[110px] shadow-sm hover:bg-sky-50 hover:shadow-md active:scale-95 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center">
                <Plus className="w-6 h-6 text-sky-400" />
              </div>

              <span className="text-sky-500 font-bold text-xs sm:text-sm">
                Custom
              </span>
            </button>
          </div>
        </div>

        {/* Right - Today's Progress */}
        <div className="bg-white border border-sky-100 rounded-3xl p-5 sm:p-6 shadow-sm w-full">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-sky-400">
                Today's Progress
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Your daily hydration
              </p>
            </div>

            <div className="w-9 h-9 rounded-full bg-sky-50 flex items-center justify-center">
              <Droplet className="w-5 h-5 text-sky-400 fill-sky-400" />
            </div>
          </div>

          {/* Progress Circle */}
          <div className="flex justify-center my-8">
            <div className="relative w-44 h-44">
              <svg
                className="w-full h-full -rotate-90"
                viewBox="0 0 160 160"
              >
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-sky-100"
                />

                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeLinecap="round"
                  className="text-sky-400 transition-all duration-500"
                  strokeDasharray={circumference}
                  strokeDashoffset={progressOffset}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-700">
                  {totalWater}ml
                </span>

                <span className="text-[11px] text-gray-400">
                  of {goal}ml
                </span>
              </div>
            </div>
          </div>

          {/* Percentage */}
          <div className="text-center mb-6">
            <p className="text-3xl font-extrabold text-sky-400">
              {Math.round(progress)}%
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Daily goal completed
            </p>
          </div>

          {/* Water Completed */}
          <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">
                  Water Completed
                </p>

                <p className="text-lg font-extrabold text-sky-400 mt-1">
                  {totalWater} ml
                </p>
              </div>

              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Plus className="w-5 h-5 text-sky-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Water Modal */}
      {showCustom && (
        <div className="fixed inset-0 z-[100] bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-extrabold text-slate-800">
              Custom Water Intake
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Masukkan jumlah air yang kamu minum
            </p>

            <div className="mt-5">
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={customAmount}
                  onChange={(e) =>
                    setCustomAmount(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCustomWater();
                    }
                  }}
                  placeholder="Contoh: 350"
                  className="w-full border border-sky-100 rounded-2xl px-4 py-3 pr-14 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  autoFocus
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                  ml
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  setShowCustom(false);
                  setCustomAmount("");
                }}
                className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleCustomWater}
                disabled={
                  !customAmount ||
                  Number(customAmount) <= 0
                }
                className="flex-1 py-3 rounded-2xl bg-sky-400 text-white font-bold hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Add Water
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}