import React, { useState, useEffect } from "react";
import { User, LogOut, Camera } from "lucide-react";

export default function Profile() {
  const [userName, setUserName] = useState("Mayonggg");
  const [firstName, setFirstName] = useState("Mayong");
  const [lastName, setLastName] = useState("Miyang");
  const [email, setEmail] = useState("mayongmiyang@gmail.com");
  const [age, setAge] = useState("25");
  const [gender, setGender] = useState("Female");

  useEffect(() => {
    const savedName = localStorage.getItem("userName");

    if (savedName) {
      setUserName(savedName);
      setFirstName(savedName);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userName");
    window.location.href = "/login";
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl shadow-sm border border-sky-50 p-6 sm:p-8 lg:p-10 min-h-[calc(100vh-80px)]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            My Profile
          </h1>

          <span className="text-sm text-slate-400 hidden sm:block">
            Account Details
          </span>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-10">
          
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-sky-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
              <User className="w-12 h-12 text-sky-400" />
            </div>

            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-sky-400 text-white flex items-center justify-center shadow-md hover:bg-sky-500 transition">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Name */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-700">
              {firstName} {lastName}
            </h2>

            <p className="text-sm sm:text-base text-slate-400 mt-1">
              Premium Hydration Member
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* First Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              First Name
            </label>

            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-sky-50 border border-transparent rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Last Name
            </label>

            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-sky-50 border border-transparent rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-sky-50 border border-transparent rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Age
            </label>

            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-sky-50 border border-transparent rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          {/* Gender */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Gender
            </label>

            <div className="flex flex-wrap items-center gap-6">
              {["Male", "Female", "Other"].map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 cursor-pointer text-sm text-slate-600"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={item}
                    checked={gender === item}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-5 h-5 accent-sky-400"
                  />

                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex justify-end mt-10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-50 text-red-500 font-bold px-6 py-3 rounded-xl hover:bg-red-100 active:scale-95 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}