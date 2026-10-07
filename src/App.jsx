import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Bell, X } from "lucide-react";

import useReminderAlarm from "./hooks/useReminderAlarm";

import { drinksApi } from "./lib/api";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import Menu from "./components/Menu";
import HomePage from "./pages/HomePage";
import Analysis from "./pages/Analysis";
import Reminder from "./pages/Reminder";
import Notes from "./pages/Notes";
import Profile from "./pages/Profile";

const isToday = (value) => {
  const drinkDate = new Date(value);
  const today = new Date();

  return (
    drinkDate.getFullYear() === today.getFullYear() &&
    drinkDate.getMonth() === today.getMonth() &&
    drinkDate.getDate() === today.getDate()
  );
};

function MainLayout() {
  const [activeTab, setActiveTab] = useState("Home");
  const [totalWater, setTotalWater] = useState(0);
  const [highlightIntake, setHighlightIntake] = useState(false);

  const { alerts, dismiss, dismissAll, permission, requestPermission } =
    useReminderAlarm();

  useEffect(() => {
    if (!highlightIntake) return;

    const timer = setTimeout(() => {
      setHighlightIntake(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, [highlightIntake]);

  const refreshWater = async () => {
    try {
      console.log("Loading water intake...");

      const drinks = await drinksApi.list();

      console.log("Drinks received from backend:", drinks);

      const total = drinks
        .filter((drink) => isToday(drink.time))
        .reduce((sum, drink) => sum + Number(drink.amount), 0);

      console.log("Today's water total:", total);

      setTotalWater(total);
    } catch (error) {
      console.error("Failed to load water intake:", error);
    }
  };

  useEffect(() => {
    refreshWater();
  }, []);

  const handleAddWater = async (amount) => {
    try {
      console.log("Adding water:", amount);

      const result = await drinksApi.create({
        amount: Number(amount),
      });

      console.log("Water successfully added:", result);

      await refreshWater();
    } catch (error) {
      console.error("Failed to add water intake:", error);
    }
  };

  const handleDrinkNow = () => {
    dismissAll();
    setHighlightIntake(true);
    setActiveTab("Home");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-screen overflow-hidden">
        <Menu
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <main className="flex-1 min-w-0 bg-white overflow-y-auto">
          <div className="p-5 md:p-8 lg:p-10 pb-24 md:pb-10">

            {activeTab === "Home" && (
              <HomePage
                onAddWater={handleAddWater}
                totalWater={totalWater}
                highlightIntake={highlightIntake}
              />
            )}

            {activeTab === "Analysis" && (
              <Analysis
                onOpenNotes={() => setActiveTab("Notification")}
              />
            )}

            {activeTab === "Reminder" && (
              <Reminder
                permission={permission}
                requestPermission={requestPermission}
              />
            )}

            {activeTab === "Notification" && <Notes />}

            {activeTab === "Profile" && <Profile />}

          </div>
        </main>
      </div>

      {alerts.length > 0 && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">

            <div className="flex items-start justify-between mb-5">

              <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center">
                <Bell className="w-8 h-8 text-sky-400" />
              </div>

              <button
                onClick={dismissAll}
                className="w-9 h-9 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            <h2 className="text-2xl font-extrabold text-slate-700">
              Waktunya minum
            </h2>

            <p className="text-sm text-gray-400 mt-2">
              {alerts[alerts.length - 1].message}
            </p>

            <div className="mt-6 flex gap-3">

              <button
                onClick={handleDrinkNow}
                className="flex-1 py-3 rounded-xl bg-sky-400 text-white font-bold hover:bg-sky-500 active:scale-95 transition"
              >
                Minum sekarang
              </button>

              <button
                onClick={() =>
                  dismiss(alerts[alerts.length - 1].uid)
                }
                className="px-5 py-3 rounded-xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition"
              >
                Nanti
              </button>

            </div>

            {alerts.length > 1 && (
              <p className="text-xs text-gray-400 text-center mt-4">
                +{alerts.length - 1} pengingat lain menunggu
              </p>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;