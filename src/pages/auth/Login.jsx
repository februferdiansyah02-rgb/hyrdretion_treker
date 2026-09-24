import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import logo from "../../assets/loginIcon.jpg";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // sementara frontend
    localStorage.setItem("userName", email.split("@")[0] || "Mayonggg");
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
            Log In
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-10 sm:mt-12">
          
          <div className="flex flex-col gap-5">
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-sky-50 rounded-xl px-4 text-sm text-slate-700 placeholder:text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
            />

            <input
              type="email"
              placeholder="Email Address"
              className="w-full h-12 bg-sky-50 rounded-xl px-4 text-sm text-slate-700 placeholder:text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-sky-50 rounded-xl px-4 pr-12 text-sm text-slate-700 placeholder:text-slate-700 outline-none focus:ring-2 focus:ring-sky-200"
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
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-sky-400 hover:text-sky-500"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full h-14 bg-sky-400 hover:bg-sky-500 text-white rounded-xl font-extrabold text-sm mt-24 sm:mt-28 active:scale-[0.98] transition"
          >
            LOG IN
          </button>

          {/* Sign Up */}
          <p className="text-center text-sm text-black mt-2">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-sky-400"
            >
              Sign up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}