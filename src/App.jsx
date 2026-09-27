import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Splash from "./pages/Splash";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

import Menu from "./components/Menu";
import HomePage from "./pages/HomePage";
import Analysis from "./pages/Analysis";
import Reminder from "./pages/Reminder";
import Profile from "./pages/Profile";

function MainLayout() {
  const [activeTab, setActiveTab] = useState("Home");
  const [totalWater, setTotalWater] = useState(500);

  const handleAddWater = (amount) => {
    setTotalWater((prev) => prev + amount);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        <Menu activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 min-w-0 bg-white">
          <div className="p-5 md:p-8 lg:p-10 pb-24 md:pb-10">
            
            {activeTab === "Home" && (
              <HomePage
                onAddWater={handleAddWater}
                totalWater={totalWater}
              />
            )}

            {activeTab === "Analysis" && <Analysis />}

            {activeTab === "Reminder" && <Reminder/>}

            {activeTab === "Notes" && (
              <PagePlaceholder title="Notes" />
            )}

            {activeTab === "Profile" && <Profile />}

          </div>
        </main>
      </div>
    </div>
  );
}

function PagePlaceholder({ title }) {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <h1 className="text-3xl font-extrabold text-slate-800">
        {title}
      </h1>

      <p className="text-gray-400 mt-2">
        Halaman {title} sedang dalam proses.
      </p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<MainLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;