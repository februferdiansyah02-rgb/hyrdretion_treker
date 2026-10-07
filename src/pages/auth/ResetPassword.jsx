import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/useAuth";

import "../../ForgotPassword.css";
import logo from "../../assets/fiveIcon.png";
import splashImage from "../../assets/logo.png";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { loading } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSession, setHasSession] = useState(null);

  useEffect(() => {
    if (loading) return;

    let cancelled = false;

    // Sesi recovery dibuat otomatis oleh supabase-js
    // dari token di URL (#access_token=...).
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      setHasSession(Boolean(session));
    });

    return () => {
      cancelled = true;
    };
  }, [loading]);

  const showError = (title, message) => {
    Swal.fire({
      imageUrl: logo,
      imageWidth: 100,
      imageHeight: 100,
      title: `<h2 style="font-size: 22px; font-weight: 800; color: #1e293b;">${title}</h2>`,
      html: `<p style="font-size: 14px; color: #64748b; margin-top: 4px;">${message}</p>`,
      confirmButtonText: "OK",
      confirmButtonColor: "#38bdf8",
      buttonsStyling: false,
      customClass: {
        popup: "rounded-3xl p-6",
        confirmButton:
          "w-full h-12 bg-sky-400 hover:bg-sky-500 text-white font-extrabold rounded-xl mt-4 transition",
      },
    });
  };

  const handleReset = async (event) => {
    event.preventDefault();

    if (isSaving) return;

    if (password !== confirmPassword) {
      showError(
        "Password Tidak Sama",
        "Password dan Confirm Password harus sama!"
      );
      return;
    }

    if (password.length < 6) {
      showError("Password Terlalu Pendek", "Minimal 6 karakter.");
      return;
    }

    setIsSaving(true);

    const { error } = await supabase.auth.updateUser({ password });

    setIsSaving(false);

    if (error) {
      showError("Gagal Reset Password", error.message);
      return;
    }

    await supabase.auth.signOut();

    Swal.fire({
      imageUrl: logo,
      imageWidth: 100,
      imageHeight: 100,
      title:
        '<h2 style="font-size: 22px; font-weight: 800; color: #1e293b;">Password Berhasil Diubah!</h2>',
      html:
        '<p style="font-size: 14px; color: #64748b; margin-top: 4px;">Silakan login dengan password barumu.</p>',
      showConfirmButton: false,
      timer: 1800,
      customClass: {
        popup: "rounded-3xl p-6",
      },
    }).then(() => {
      navigate("/login");
    });
  };

  if (hasSession === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (hasSession === false) {
    return (
      <div className="forgot-page">
        <div className="forgot-visual">
          <img src={splashImage} alt="" className="forgot-visual-image" />
          <h2>Hydration Tracker</h2>
          <p>Stay hydrated, stay healthy.</p>
        </div>

        <div className="forgot-screen">
          <div className="forgot-card">
            <img src={logo} alt="" className="forgot-mascot" />

            <h1 className="forgot-title">Link Tidak Valid</h1>
            <p className="forgot-subtitle">
              Link reset password sudah kedaluwarsa atau belum pernah
              diminta. Silakan minta link baru.
            </p>

            <button
              className="forgot-button"
              onClick={() => navigate("/forgot-password")}
            >
              MINTA LINK BARU
            </button>

            <p className="forgot-login">
              Back to{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
              >
                Log In
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-page">
      <div className="forgot-visual">
        <img src={splashImage} alt="" className="forgot-visual-image" />
        <h2>Hydration Tracker</h2>
        <p>Stay hydrated, stay healthy.</p>
      </div>

      <div className="forgot-screen">
        <button className="forgot-back" onClick={() => navigate("/login")}>
          ←
        </button>

        <div className="forgot-card">
          <img src={logo} alt="" className="forgot-mascot" />

          <h1 className="forgot-title">Reset Password</h1>
          <p className="forgot-subtitle">Masukkan password barumu di bawah</p>

          <form onSubmit={handleReset}>
            <div className="forgot-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password Baru"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="forgot-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="forgot-field">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password Baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="forgot-eye"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              className="forgot-button"
              disabled={isSaving}
            >
              {isSaving ? "MENYIMPAN..." : "SIMPAN PASSWORD BARU"}
            </button>
          </form>

          <p className="forgot-login">
            Back to{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
            >
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
