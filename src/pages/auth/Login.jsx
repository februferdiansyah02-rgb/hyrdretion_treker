import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

import logo from "../../assets/loginIcon.jpg";
import fiveicon from "../../assets/fiveicon.png";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.userName || email.split("@")[0]);
        localStorage.setItem("userEmail", email.trim());

        Swal.fire({
          imageUrl: logo,
          imageWidth: 100,
          imageHeight: 100,
          imageAlt: "Success Mascot",
          title:
            '<h2 style="font-size: 22px; font-weight: 800; color: #1e293b;">Login Berhasil!</h2>',
          html:
            '<p style="font-size: 14px; color: #64748b; margin-top: 4px;">Selamat datang kembali di Hydration Tracker </p>',
          showConfirmButton: false,
          timer: 1500,
          customClass: {
            popup: "rounded-3xl p-6",
          },
        }).then(() => {
          navigate("/dashboard");
        });
      } else {
        Swal.fire({
          imageUrl: fiveicon,
          imageWidth: 100,
          imageHeight: 100,
          imageAlt: "Wrong Password Mascot",
          title:
            '<h2 style="font-size: 22px; font-weight: 800; color: #1e293b;">Gagal Masuk</h2>',
          html: `<p style="font-size: 14px; color: #64748b; margin-top: 4px;">${
            data.message || "Email atau password yang kamu masukkan salah."
          }</p>`,
          confirmButtonText: "COBA LAGI",
          confirmButtonColor: "#38bdf8",
          buttonsStyling: false,
          customClass: {
            popup: "rounded-3xl p-6",
            confirmButton:
              "w-full h-12 bg-sky-400 hover:bg-sky-500 text-white font-extrabold rounded-xl mt-4 transition",
          },
        });
      }
    } catch (err) {
      console.error("Error connecting to server:", err);

      Swal.fire({
        imageUrl: fiveicon,
        imageWidth: 100,
        imageHeight: 100,
        imageAlt: "Connection Error Mascot",
        title:
          '<h2 style="font-size: 22px; font-weight: 800; color: #1e293b;">Koneksi Gagal</h2>',
        html:
          '<p style="font-size: 14px; color: #64748b; margin-top: 4px;">Tidak dapat terhubung ke server backend.</p>',
        confirmButtonText: "OK",
        buttonsStyling: false,
        customClass: {
          popup: "rounded-3xl p-6",
          confirmButton:
            "w-full h-12 bg-sky-400 hover:bg-sky-500 text-white font-extrabold rounded-xl mt-4 transition",
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md min-h-screen sm:min-h-0 flex flex-col">
        <button
          onClick={() => navigate(-1)}
          className="pt-7 w-fit text-sky-400 hover:text-sky-500 transition"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>

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

        <form onSubmit={handleLogin} className="mt-10 sm:mt-12">
          <div className="flex flex-col gap-5">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-sky-50 rounded-xl px-4 text-sm text-slate-700 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-sky-200"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-sky-50 rounded-xl px-4 pr-12 text-sm text-slate-700 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-sky-200"
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
          </div>

          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-sky-400 hover:text-sky-500"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full h-14 bg-sky-400 hover:bg-sky-500 text-white rounded-xl font-extrabold text-sm mt-24 sm:mt-28 active:scale-[0.98] transition"
          >
            LOG IN
          </button>

          <p className="text-center text-sm text-black mt-5">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-sky-400 font-medium"
            >
              Sign up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}