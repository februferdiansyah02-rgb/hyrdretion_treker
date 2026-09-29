import React, { useEffect, useState } from "react";
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
import Notes from "./pages/Notes";
import Profile from "./pages/Profile";

function MainLayout() {
  const [activeTab, setActiveTab] = useState("Home");
  const [totalWater, setTotalWater] = useState(0);

  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/drinks");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Gagal mengambil data minum");
        }

        const total = result.data.reduce(
          (sum, drink) => sum + Number(drink.amount),
          0
        );

        setTotalWater(total);
      } catch (error) {
        console.error("Gagal mengambil data minum:", error);
      }
    };

    fetchDrinks();
  }, []);

  const handleAddWater = async (amount) => {
    try {
      const response = await fetch("http://localhost:3000/api/drinks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menambahkan air");
      }

      console.log("Data berhasil ditambahkan:", result);

      setTotalWater((prev) => prev + Number(result.data.amount));
    } catch (error) {
      console.error("Gagal menambahkan air:", error);
    }
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
              />
            )}

            {activeTab === "Analysis" && <Analysis />}

            {activeTab === "Reminder" && <Reminder />}

            {activeTab === "Notes" && <Notes />}

            {activeTab === "Profile" && <Profile />}

          </div>
        </main>
      </div>
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