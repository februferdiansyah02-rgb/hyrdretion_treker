// Pengganti cron `node-cron` di backend/server.js — di Netlify nggak ada server
// yang hidup terus, jadi job kirim Web Push dijalankan sebagai scheduled function
// tiap menit (lihat `config.schedule` di bawah).
import { runReminderPushJob } from "../../backend/jobs/reminderPushJob.js";

export default async () => {
  await runReminderPushJob();
};

export const config = {
  schedule: "* * * * *",
};
