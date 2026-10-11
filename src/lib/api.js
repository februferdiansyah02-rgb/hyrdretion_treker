import { supabase } from "./supabase";

export const API_BASE = "http://localhost:3000/api";

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

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

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