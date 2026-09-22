import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Splash from './pages/Splash';
import Onboarding from './pages/Onboarding';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Menu from './components/Menu';
import Homepage from './pages/HomePage';


function MainLayout() {
  const [activeTab, setActiveTab] = useState('Home');
  const [totalWater, setTotalWater] = useState(500);

  // Fungsi untuk menambah jumlah air ketika tombol cepat diklik
  const handleAddWater = (amount) => {
    setTotalWater((prev) => prev + amount);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 overflow-hidden">

      <Menu activeTab={activeTab} setActiveTab={setActiveTab} />


      <main className="flex-1 flex flex-col overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
        {activeTab === 'Home' && <Homepage onAddWater={handleAddWater} totalWater={totalWater} />}
        {activeTab === 'Analysis' && <div className="text-2xl font-bold">Halaman Analysis</div>}
        {activeTab === 'Reminder' && <div className="text-2xl font-bold">Halaman Reminder</div>}
        {activeTab === 'Notes' && <div className="text-2xl font-bold">Halaman Notes</div>}
        {activeTab === 'User' && <div className="text-2xl font-bold">Halaman User / Profile</div>}
      </main>
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