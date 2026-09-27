import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import logo from "../../assets/loginIcon.jpg";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    localStorage.setItem("userName", fullName || "Mayonggg");

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md min-h-screen sm:min-h-0 flex flex-col">
        
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="pt-7 w-fit text-sky-400 hover:text-sky-500 transition"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mt-12 sm:mt-10">
          <img
            src={logo}
            alt="Hydrate"
            className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
          />

          <h1 className="text-2xl sm:text-3xl font-extrabold text-black mt-1">
            Sign Up
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="mt-10 sm:mt-12">
          <div className="flex flex-col gap-5">
            
            {/* Full Name */}
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-12 bg-sky-50 rounded-xl px-4 text-sm text-slate-700 placeholder:text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
              required
            />

            {/* Email */}
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-sky-50 rounded-xl px-4 text-sm text-slate-700 placeholder:text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
              required
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-sky-50 rounded-xl px-4 pr-12 text-sm text-slate-700 placeholder:text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-12 bg-sky-50 rounded-xl px-4 pr-12 text-sm text-slate-700 placeholder:text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            className="w-full h-14 bg-sky-400 hover:bg-sky-500 text-white rounded-xl font-extrabold text-sm mt-24 sm:mt-28 active:scale-[0.98] transition"
          >
            SIGN UP
          </button>

          {/* Login */}
          <p className="text-center text-sm text-black mt-2">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sky-400"
            >
              Log In
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}