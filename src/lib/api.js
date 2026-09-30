export const API_BASE = "http://localhost:3000/api";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Gagal memproses permintaan");
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
