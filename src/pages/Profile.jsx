import { useRef, useState } from "react";
import {
  User,
  LogOut as LogOutIcon,
  Camera,
  Save,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logout from "../components/Logut";

export default function Profile() {
  const navigate = useNavigate();
  const photoInputRef = useRef(null);
  const photoRequestRef = useRef(0);

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
    () => localStorage.getItem("userEmail") || ""
  );
  const [age, setAge] = useState(
    () => localStorage.getItem("userAge") || "25"
  );
  const [gender, setGender] = useState(
    () => localStorage.getItem("userGender") || "Female"
  );
  const [profilePhoto, setProfilePhoto] = useState(
    () => localStorage.getItem("userPhoto") || ""
  );

  const [saveMessage, setSaveMessage] = useState("");
  const [photoMessage, setPhotoMessage] = useState("");
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const inputClass =
    "w-full bg-sky-50 border border-transparent rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100";

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPhotoMessage("Please choose a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoMessage("The image must be 2 MB or smaller.");
      return;
    }

    const requestId = ++photoRequestRef.current;
    const reader = new FileReader();

    setIsPhotoLoading(true);
    setPhotoMessage("");

    const fail = (message) => {
      if (requestId !== photoRequestRef.current) return;
      setIsPhotoLoading(false);
      setPhotoMessage(message);
    };

    reader.onerror = () => {
      fail("Unable to read the image. Please try again.");
    };

    reader.onload = () => {
      if (requestId !== photoRequestRef.current) return;

      const image = new Image();

      image.onerror = () => {
        fail("Unable to open this image. Please choose another file.");
      };

      image.onload = () => {
        if (requestId !== photoRequestRef.current) return;

        try {
          // Perkecil foto sebelum disimpan ke browser.
          const scale = Math.min(
            1,
            400 / Math.max(image.naturalWidth, image.naturalHeight)
          );

          const canvas = document.createElement("canvas");
          canvas.width = Math.max(
            1,
            Math.round(image.naturalWidth * scale)
          );
          canvas.height = Math.max(
            1,
            Math.round(image.naturalHeight * scale)
          );

          const context = canvas.getContext("2d");

          if (!context) {
            throw new Error("Unable to process image");
          }

          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);

          const photoData = canvas.toDataURL("image/jpeg", 0.85);

          localStorage.setItem("userPhoto", photoData);
          setProfilePhoto(photoData);
          setPhotoMessage("Profile photo updated successfully.");
        } catch {
          setPhotoMessage(
            "Unable to save the photo. Browser storage may be full."
          );
        } finally {
          setIsPhotoLoading(false);
        }
      };

      image.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    photoRequestRef.current += 1;
    setIsPhotoLoading(false);

    try {
      localStorage.removeItem("userPhoto");
      setProfilePhoto("");
      setPhotoMessage("Profile photo removed successfully.");

      if (photoInputRef.current) {
        photoInputRef.current.value = "";
      }
    } catch {
      setPhotoMessage("Unable to remove the photo. Please try again.");
    }
  };

  const handleSave = () => {
    const cleanFirstName = firstName.trim().replace(/\s+/g, " ");
    const cleanLastName = lastName.trim().replace(/\s+/g, " ");
    const cleanEmail = email.trim();
    const cleanAge = String(age).trim();

    if (!cleanFirstName) {
      setSaveMessage("First Name is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setSaveMessage("Please enter a valid email address.");
      return;
    }

    const ageNumber = Number(cleanAge);

    if (
      !cleanAge ||
      !Number.isInteger(ageNumber) ||
      ageNumber < 1 ||
      ageNumber > 120
    ) {
      setSaveMessage("Age must be a whole number between 1 and 120.");
      return;
    }

    if (!["Male", "Female", "Other"].includes(gender)) {
      setSaveMessage("Please select an available gender.");
      return;
    }

    const fullName = [cleanFirstName, cleanLastName]
      .filter(Boolean)
      .join(" ");

    try {
      localStorage.setItem("userName", fullName);
      localStorage.setItem("userEmail", cleanEmail);
      localStorage.setItem("userAge", String(ageNumber));
      localStorage.setItem("userGender", gender);

      setSavedName(fullName);
      setFirstName(cleanFirstName);
      setLastName(cleanLastName);
      setEmail(cleanEmail);
      setAge(String(ageNumber));
      setSaveMessage("Profile updated successfully.");
    } catch {
      setSaveMessage("Unable to save all profile details. Please try again.");
    }
  };

  const handleFinalLogout = () => {
    // Cegah proses upload menyimpan foto setelah logout.
    photoRequestRef.current += 1;

    [
      "token",
      "userName",
      "userEmail",
      "userAge",
      "userGender",
      "userPhoto",
    ].forEach((key) => {
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

        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-4">
          <div className="relative w-24 h-24 shrink-0">
            <div className="w-full h-full rounded-full bg-sky-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-sky-400" />
              )}
            </div>

            <button
              type="button"
              aria-label="Change profile photo"
              title="Change profile photo"
              onClick={() => photoInputRef.current?.click()}
              disabled={isPhotoLoading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-sky-400 text-white flex items-center justify-center shadow-md hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Camera className="w-4 h-4" />
            </button>

            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              aria-label="Choose profile photo"
              className="hidden"
            />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-700">
              {savedName}
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-1">
              Premium Hydration Member
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-3">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={isPhotoLoading}
                className="text-sm font-semibold text-sky-500 hover:text-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPhotoLoading
                  ? "Processing..."
                  : profilePhoto
                    ? "Change Photo"
                    : "Upload Photo"}
              </button>

              {profilePhoto && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove Photo
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          JPG, PNG, or WebP. Maximum file size: 2 MB.
        </p>

        {photoMessage && (
          <p role="status" className="mt-2 text-sm text-slate-600">
            {photoMessage}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
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
              onChange={(event) => {
                setFirstName(event.target.value);
                setSaveMessage("");
              }}
              className={inputClass}
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
              onChange={(event) => {
                setLastName(event.target.value);
                setSaveMessage("");
              }}
              className={inputClass}
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
              placeholder="Enter your email address"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setSaveMessage("");
              }}
              className={inputClass}
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
              onChange={(event) => {
                setAge(event.target.value);
                setSaveMessage("");
              }}
              className={inputClass}
            />
          </div>

          <fieldset className="md:col-span-2">
            <legend className="block text-sm font-semibold text-slate-700 mb-3">
              Gender
            </legend>
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
                    onChange={(event) => {
                      setGender(event.target.value);
                      setSaveMessage("");
                    }}
                    className="w-5 h-5 accent-sky-400"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </fieldset>
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