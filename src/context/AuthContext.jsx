import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./authContextInstance";

const LEGACY_STORAGE_KEYS = [
  "token",
  "userName",
  "userEmail",
  "userAge",
  "userGender",
  "userPhoto",
];

function syncLegacyStorage(profile) {
  try {
    if (profile) {
      localStorage.setItem("userName", profile.full_name || "");
      localStorage.setItem("userEmail", profile.email || "");
      if (profile.age != null) localStorage.setItem("userAge", String(profile.age));
      if (profile.gender) localStorage.setItem("userGender", profile.gender);
      if (profile.photo) localStorage.setItem("userPhoto", profile.photo);
      else localStorage.removeItem("userPhoto");
    } else {
      LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    }
  } catch {
    // localStorage penuh / tidak tersedia - abaikan
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (user) => {
    if (!user?.id) {
      setProfile(null);
      syncLegacyStorage(null);
      return null;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Fallback ke metadata akun Supabase Auth kalau baris profiles
    // belum ada / full_name kosong, supaya nama asli user tetap tampil.
    const metadata = user.user_metadata || {};
    const fallbackName = metadata.full_name || metadata.name || "";

    const merged = {
      id: user.id,
      email: data?.email || user.email || "",
      full_name: (data?.full_name || "").trim() || fallbackName,
      age: data?.age ?? null,
      gender: data?.gender || "Other",
      photo: data?.photo || null,
    };

    setProfile(merged);
    syncLegacyStorage(merged);
    return merged;
  }, []);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;
      setSession(session);
      if (session?.user) await loadProfile(session.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);

      if (event === "SIGNED_IN" && newSession?.user) {
        loadProfile(newSession.user);
      } else if (event === "SIGNED_OUT") {
        setProfile(null);
        syncLegacyStorage(null);
      } else if (
        (event === "USER_UPDATED" || event === "TOKEN_REFRESHED") &&
        newSession?.user
      ) {
        loadProfile(newSession.user);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (!session) return null;
    return loadProfile(session.user);
  }, [loadProfile, session]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    syncLegacyStorage(null);
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    refreshProfile,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
