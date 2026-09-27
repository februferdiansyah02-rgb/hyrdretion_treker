import React, { useState } from "react";
import Exit from "../assets/Exit.png";
import Keluar from "../assets/Keluar.png";

export default function Logout({ isOpen, onClose, onConfirmLogout }) {
  const [step, setStep] = useState("confirm");

  if (!isOpen) return null;

  const handleActionClick = () => {
    if (step === "confirm") {
      setStep("success");
    } else {
      onConfirmLogout();
    }
  };

  const handleCloseModal = () => {
    setStep("confirm");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transition-all">
        
        {step === "confirm" ? (
      
          <div>
            <div className="flex justify-center mb-6">
              <img
                src={Exit}
                alt="Log Out Illustration"
                className="h-36 object-contain"
              />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">Log Out</h2>
            <p className="text-slate-600 text-sm mb-6">
              Are you sure you want to log out?
            </p>

            <button
              onClick={handleActionClick}
              className="w-full bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all uppercase tracking-wide text-sm mb-4"
            >
              LOG OUT
            </button>

            <button
              onClick={handleCloseModal}
              className="text-xs text-slate-600 font-medium hover:text-slate-800"
            >
              Back to <span className="text-sky-500 font-semibold hover:underline">Home</span>
            </button>
          </div>
        ) : (
       
          <div>
            <div className="flex justify-center mb-6">
              <img
                src={Keluar}
                alt="Logged Out Illustration"
                className="h-36 object-contain"
              />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              You’re Logged Out
            </h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Log in again to continue<br />tracking your hydration journey!
            </p>

            <button
              onClick={handleActionClick}
              className="w-full bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all uppercase tracking-wide text-sm mb-4"
            >
              LOG IN
            </button>

            <p className="text-xs text-slate-600">
              Don’t have an account?{" "}
              <a href="/register" className="text-sky-500 font-semibold hover:underline">
                Sign Up
              </a>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}