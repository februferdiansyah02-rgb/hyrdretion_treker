import { useState } from "react";
import { User, LogOut as LogOutIcon, Camera, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logout from "../components/Logut";

export default function Profile() {
  const navigate = useNavigate();

  const [savedName, setSavedName] = useState(
    () => localStorage.getItem("userName") || "Mayong Miyang"
  );
  const [firstName, setFirstName] = useState(
    () => savedName.trim().split(/\s+/)[0]
  );
  const [lastName, setLastName] = useState(
    () => savedName.trim().split(/\s+/).slice(1).join(" ")
  );

  const [email, setEmail] = useState(
    () => localStorage.getItem("userEmail") || "mayongmiyang@gmail.com"
  );
  const [age, setAge] = useState(
    () => localStorage.getItem("userAge") || "25"
  );
  const [gender, setGender] = useState(
    () => localStorage.getItem("userGender") || "Female"
  );

  const [saveMessage, setSaveMessage] = useState("");
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleSave = () => {
    const cleanFirstName = firstName.trim().replace(/\s+/g, " ");
    const cleanLastName = lastName.trim().replace(/\s+/g, " ");
    const cleanEmail = email.trim();
    const cleanAge = String(age).trim();

    if (!cleanFirstName) {
      setSaveMessage("First Name wajib diisi.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setSaveMessage("Masukkan email yang valid.");
      return;
    }

    const ageNumber = Number(cleanAge);

    if (
      !cleanAge ||
      !Number.isInteger(ageNumber) ||
      ageNumber < 1 ||
      ageNumber > 120
    ) {
      setSaveMessage("Age harus berupa angka bulat antara 1–120.");
      return;
    }

    if (!["Male", "Female", "Other"].includes(gender)) {
      setSaveMessage("Pilih gender yang tersedia.");
      return;
    }

    const fullName = [cleanFirstName, cleanLastName]
      .filter(Boolean)
      .join(" ");

    try {
      // Home membaca nama dari key userName.
      localStorage.setItem("userName", fullName);
      localStorage.setItem("userEmail", cleanEmail);
      localStorage.setItem("userAge", String(ageNumber));
      localStorage.setItem("userGender", gender);

      setSavedName(fullName);
      setFirstName(cleanFirstName);
      setLastName(cleanLastName);
      setEmail(cleanEmail);
      setAge(String(ageNumber));
      setSaveMessage("Data profile berhasil disimpan.");
    } catch {
      setSaveMessage("Data gagal disimpan sepenuhnya. Coba lagi.");
    }
  };

  const handleFinalLogout = () => {
    // Bersihkan data profile agar tidak terbawa ke pengguna berikutnya.
    ["userName", "userEmail", "userAge", "userGender"].forEach((key) => {
      localStorage.removeItem(key);
    });
    navigate("/login");
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl shadow-sm border border-sky-50 p-6 sm:p-8 lg:p-10 min-h-[calc(100vh-80px)]">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            My Profile
          </h1>
          <span className="text-sm text-slate-400 hidden sm:block">
            Account Details
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-sky-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
              <User className="w-12 h-12 text-sky-400" />
            </div>
            <button
              type="button"
              aria-label="Change profile photo"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-sky-400 text-white flex items-center justify-center shadow-md hover:bg-sky-500 transition"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-700">
              {savedName}
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-1">
              Premium Hydration Member
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setSaveMessage("");
              }}
              className="w-full bg-sky-50 border border-transparent rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setSaveMessage("");
              }}
              className="w-full bg-sky-50 border border-transparent rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSaveMessage("");
              }}
              className="w-full bg-sky-50 border border-transparent rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div>
            <label
              htmlFor="age"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Age
            </label>
            <input
              id="age"
              type="number"
              min="1"
              max="120"
              step="1"
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                setSaveMessage("");
              }}
              className="w-full bg-sky-50 border border-transparent rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            />
          </div>

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
                    onChange={(e) => {
                      setGender(e.target.value);
                      setSaveMessage("");
                    }}
                    className="w-5 h-5 accent-sky-400"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {saveMessage && (
          <p role="status" className="mt-6 text-sm text-slate-600">
            {saveMessage}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3 mt-10">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 bg-sky-400 text-white font-bold px-6 py-3 rounded-xl hover:bg-sky-500 active:scale-95 transition-all"
          >
            <Save className="w-5 h-5" />
            Save Profile
          </button>

          <button
            type="button"
            onClick={() => setIsLogoutOpen(true)}
            className="flex items-center gap-2 bg-red-50 text-red-500 font-bold px-6 py-3 rounded-xl hover:bg-red-100 active:scale-95 transition-all"
          >
            <LogOutIcon className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </div>

      <Logout
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirmLogout={handleFinalLogout}
      />
    </div>
  );
}