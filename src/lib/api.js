import { supabase } from "./supabase";

export const API_BASE = "/api";

const request = async (path, options = {}) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  let response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // Token bisa saja kedaluwarsa (access token Supabase umur ~1 jam) atau
  // sesinya sudah dicabut di server. Coba refresh sekali lalu ulangi request.
  if (response.status === 401) {
    const { data: refreshed, error: refreshError } =
      await supabase.auth.refreshSession();
    const newToken = refreshed?.session?.access_token;

    if (!refreshError && newToken && newToken !== session?.access_token) {
      response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
      });
    }

    // Masih 401 setelah refresh -> sesi emang sudah mati, paksa login ulang.
    if (response.status === 401) {
      await supabase.auth.signOut().catch(() => {});
      throw new Error("Sesi kamu sudah berakhir. Silakan login ulang.");
    }
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Failed to process request");
  }

  return result.data;
};

export const reminderApi = {
  list: () => request("/reminders"),
  create: (payload) =>
    request("/reminders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id, payload) =>
    request(`/reminders/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  remove: (id) => request(`/reminders/${id}`, { method: "DELETE" }),
  getAuto: () => request("/reminders/auto"),
  setAuto: (payload) =>
    request("/reminders/auto", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  due: () => request("/reminders/due"),
  history: () => request("/reminders/history"),
  getVapidPublicKey: () => request("/push/vapid-public-key"),
  savePushSubscription: (subscription) =>
    request("/push/subscribe", {
      method: "POST",
      body: JSON.stringify({ subscription }),
    }),
  testPush: () => request("/push/test", { method: "POST" }),
};

export const drinksApi = {
  list: () => request("/drinks"),
  create: (payload) =>
    request("/drinks", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  remove: (id) => request(`/drinks/${id}`, { method: "DELETE" }),
};

export const notesApi = {
  list: (goal = 2000) => request(`/notes?goal=${goal}`),
};
