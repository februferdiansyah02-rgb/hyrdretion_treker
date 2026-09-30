import React, { useState, useEffect } from "react";
import { Droplet, Plus, X } from "lucide-react";
import logo from "../assets/logo.png";

export default function HomePage({
  onAddWater,
  onResetWater,
  totalWater = 0,
  highlightIntake = false,
}) {
  const [userName, setUserName] = useState("Mayonggg");
  const [goal, setGoal] = useState(2000);
  const [customAmount, setCustomAmount] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [showGoal, setShowGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("2000");
  const [currentTime, setCurrentTime] = useState("");
  const [notification, setNotification] = useState("");

  const quickAddOptions = [
    { label: "250 ML", value: 250 },
    { label: "500 ML", value: 500 },
    { label: "700 ML", value: 700 },
    { label: "1 L", value: 1000 },
  ];


  useEffect(() => {
    const savedName = localStorage.getItem("userName");
    const savedGoal = localStorage.getItem("waterGoal");

    if (savedName) setUserName(savedName);

    if (savedGoal) {
      setGoal(Number(savedGoal));
      setGoalInput(savedGoal);
    }
  }, []);

 
  useEffect(() => {
    const checkDailyReset = () => {
      const lastReset = localStorage.getItem("waterLastReset");
      const now = Date.now();

      if (!lastReset) {
        localStorage.setItem("waterLastReset", String(now));
        return;
      }

      const elapsed = now - Number(lastReset);
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (elapsed >= twentyFourHours) {
        localStorage.setItem("waterLastReset", String(now));

    
        if (onResetWater) {
          onResetWater();
        }

        showNotification("Hari baru dimulai  Progress air kamu sudah direset.");
      }
    };

    checkDailyReset();
    const interval = setInterval(checkDailyReset, 60 * 1000);

    return () => clearInterval(interval);
  }, [onResetWater]);


  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";

      hours = hours % 12;
      hours = hours || 12;

      setCurrentTime(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
          2,
          "0"
        )} ${ampm}`
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []);

  const showNotification = (message) => {
    setNotification(message);

    setTimeout(() => {
      setNotification("");
    }, 3000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const remainingWater = Math.max(goal - totalWater, 0);
  const progress = Math.min((totalWater / goal) * 100, 100);
  const goalReached = totalWater >= goal;

 
  const addWater = (requestedAmount) => {
    const amount = Number(requestedAmount);

    if (!amount || amount <= 0) {
      showNotification("Masukkan jumlah air yang valid.");
      return;
    }

    if (goalReached) {
      showNotification(" Target hari ini sudah tercapai!");
      return;
    }

    const allowedAmount = Math.min(amount, remainingWater);

    if (onAddWater) {
      onAddWater(allowedAmount);
    }

    if (allowedAmount < amount) {
      showNotification(
        `Kamu hanya bisa menambah ${allowedAmount} ml lagi agar sesuai goal.`
      );
    } else if (totalWater + allowedAmount >= goal) {
      showNotification(" Mantap! Target minum hari ini tercapai!");
    } else {
      showNotification(`+${allowedAmount} ml berhasil ditambahkan `);
    }
  };

  const handleGoal = () => {
    setGoalInput(String(goal));
    setShowGoal(true);
  };

  const saveGoal = () => {
    const parsedGoal = Number(goalInput);

    if (!parsedGoal || parsedGoal <= 0) {
      showNotification("Goal harus lebih dari 0 ml.");
      return;
    }

    setGoal(parsedGoal);
    localStorage.setItem("waterGoal", String(parsedGoal));
    setShowGoal(false);

   
    showNotification(`Goal harian berhasil diatur ke ${parsedGoal} ml `);
  };

  const handleCustomWater = () => {
    const amount = Number(customAmount);

    if (!amount || amount <= 0) {
      showNotification("Masukkan jumlah air yang valid.");
      return;
    }

    addWater(amount);
    setCustomAmount("");
    setShowCustom(false);
  };

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progressOffset =
    circumference - (progress / 100) * circumference;

  return (
    <div className="w-full max-w-7xl mx-auto relative">

   
      {notification && (
        <div className="fixed top-5 right-5 z-[200] max-w-sm bg-white border border-sky-100 shadow-xl rounded-2xl px-5 py-4 flex items-start gap-3 animate-[slideIn_.3s_ease-out]">
          <div className="w-9 h-9 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
            <Droplet className="w-5 h-5 text-sky-400 fill-sky-400" />
          </div>
          <p className="text-sm font-bold text-slate-700 pt-1">
            {notification}
          </p>
        </div>
      )}

      <div className="mb-6">
        <p className="text-gray-400 font-semibold text-sm sm:text-base">
          {getGreeting()}
        </p>

        <h1 className="text-sky-400 font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight">
          {userName}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-start">

    
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* GOAL CARD */}
          <div className="relative w-full min-h-[220px] sm:min-h-[240px] rounded-3xl overflow-hidden bg-sky-400 p-5 sm:p-7 shadow-lg shadow-sky-100">
            <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/10" />
            <div className="absolute -left-20 -bottom-20 w-56 h-56 rounded-full bg-white/10" />

            <div className="relative z-10 max-w-[60%]">
              <span className="inline-block bg-white/90 text-sky-500 px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                {currentTime || "11:00 AM"}
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

     
          <div
            className={`rounded-3xl transition-all duration-500 ${
              highlightIntake
                ? "ring-4 ring-sky-200 bg-sky-50/50 p-5 -m-5 animate-pulse"
                : ""
            }`}
          >
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
              Add Water Intake
            </h2>

            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              {goalReached
                ? "Target hari ini sudah tercapai "
                : `Sisa target hari ini: ${remainingWater} ml`}
            </p>
          </div>

          {highlightIntake && (
            <div className="rounded-2xl bg-sky-50 border border-sky-100 p-4 flex items-center gap-3">
              <Droplet className="w-5 h-5 text-sky-400 fill-sky-400 shrink-0" />
              <p className="text-sm font-bold text-sky-500">
                Pilih jumlah air di bawah untuk mencatat yang baru kamu minum
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            {quickAddOptions.map((item) => {
              const disabled = goalReached;

              return (
                <button
                  key={item.value}
                  disabled={disabled}
                  onClick={() => addWater(item.value)}
                  className="bg-white border border-sky-100 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2 min-h-[110px] shadow-sm hover:border-sky-300 hover:shadow-md active:scale-95 transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                    <Droplet className="w-6 h-6 text-sky-400 fill-sky-400 group-hover:scale-110 transition-transform" />
                  </div>

                  <span className="text-sky-500 font-bold text-xs sm:text-sm">
                    {item.label}
                  </span>
                </button>
              );
            })}

            <button
              disabled={goalReached}
              onClick={() => setShowCustom(true)}
              className="bg-white border border-dashed border-sky-300 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2 min-h-[110px] shadow-sm hover:bg-sky-50 hover:shadow-md active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
                  {Math.min(totalWater, goal)}ml
                </span>

                <span className="text-[11px] text-gray-400">
                  of {goal}ml
                </span>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-3xl font-extrabold text-sky-400">
              {Math.round(progress)}%
            </p>

            <p className="text-xs text-gray-400 mt-1">
              {goalReached ? "Daily goal completed " : "Daily goal progress"}
            </p>
          </div>

          <div className="bg-sky-50 p-4 rounded-2xl border border-sky-100">
            <p className="text-xs text-gray-400">
              Water Completed
            </p>

            <p className="text-lg font-extrabold text-sky-400 mt-1">
              {Math.min(totalWater, goal)} ml
            </p>

            {!goalReached && (
              <p className="text-xs text-gray-400 mt-1">
                {remainingWater} ml lagi untuk mencapai goal
              </p>
            )}
          </div>
        </div>
      </div>

  
      {showGoal && (
        <div className="fixed inset-0 z-[100] bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-800">
                Set Your Goal
              </h2>

              <button
                onClick={() => setShowGoal(false)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-gray-400 mt-1">
              Tentukan target air harian kamu.
            </p>

            <div className="relative mt-5">
              <input
                type="number"
                min="1"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveGoal();
                }}
                className="w-full border border-sky-100 rounded-2xl px-4 py-3 pr-14 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="Contoh: 2000"
                autoFocus
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                ml
              </span>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowGoal(false)}
                className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition"
              >
                Cancel
              </button>

              <button
                onClick={saveGoal}
                className="flex-1 py-3 rounded-2xl bg-sky-400 text-white font-bold hover:bg-sky-500 transition"
              >
                Save Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM WATER MODAL */}
      {showCustom && (
        <div className="fixed inset-0 z-[100] bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-800">
                Custom Water Intake
              </h2>

              <button
                onClick={() => {
                  setShowCustom(false);
                  setCustomAmount("");
                }}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-gray-400 mt-1">
              Sisa goal kamu: <b>{remainingWater} ml</b>
            </p>

            <div className="mt-5 relative">
              <input
                type="number"
                min="1"
                max={remainingWater}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCustomWater();
                }}
                placeholder={`Maksimal ${remainingWater} ml`}
                className="w-full border border-sky-100 rounded-2xl px-4 py-3 pr-14 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                autoFocus
              />

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                ml
              </span>
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
                  Number(customAmount) <= 0 ||
                  remainingWater <= 0
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
