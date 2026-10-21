const { sendPush } = require("../utils/webpush");
const supabaseModule = require("../config/supabase");
const supabase = supabaseModule.supabase || supabaseModule;

const isCustomDue = (reminder, now) => {
  if (!reminder?.enabled) return false;
  if (reminder.lastFiredAt) {
    const last = new Date(reminder.lastFiredAt);
    if (
      last.getFullYear() === now.getFullYear() &&
      last.getMonth() === now.getMonth() &&
      last.getDate() === now.getDate()
    ) {
      return false;
    }
  }
  const [h, m] = (reminder.time || "00:00").split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return false;
  if (now.getHours() !== h) return false;
  if (now.getMinutes() !== m) return false;
  return true;
};

const isAutoDue = (auto, now) => {
  if (!auto.enabled) return false;
  const [startH, startM] = (auto.startTime || "07:00").split(":").map(Number);
  const [endH, endM] = (auto.endTime || "22:00").split(":").map(Number);
  if ([startH, startM, endH, endM].some((n) => Number.isNaN(n))) return false;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (endMinutes < startMinutes) {
    if (nowMinutes < startMinutes && nowMinutes > endMinutes) return false;
  } else if (nowMinutes < startMinutes || nowMinutes > endMinutes) {
    return false;
  }

  if (auto.lastFiredAt) {
    const last = new Date(auto.lastFiredAt);
    const diffMs = now.getTime() - last.getTime();
    const intervalMs = (auto.intervalMinutes || 60) * 60000;
    if (diffMs < intervalMs - 30000) return false;
  }

  return now.getMinutes() % (auto.intervalMinutes || 60) === 0;
};

const DEFAULT_AUTO = {
  enabled: false,
  startTime: "07:00",
  endTime: "22:00",
  intervalMinutes: 60,
  lastFiredAt: null,
};

const toAuto = (row) => ({
  enabled: row.enabled,
  startTime: row.start_time,
  endTime: row.end_time,
  intervalMinutes: row.interval_minutes,
  lastFiredAt: row.last_fired_at,
});

const toReminder = (row) => ({
  id: row.id,
  time: row.time,
  enabled: row.enabled,
  type: row.type,
  lastFiredAt: row.last_fired_at,
  createdAt: row.created_at,
});

const runReminderPushJob = async () => {
  const now = new Date();
  try {
    const idsSet = new Set();
    const { data: r1 } = await supabase.from("reminders").select("user_id");
    (r1 || []).forEach((r) => idsSet.add(r.user_id));
    const { data: r2 } = await supabase.from("auto_reminders").select("user_id");
    (r2 || []).forEach((r) => idsSet.add(r.user_id));
    const { data: r3 } = await supabase.from("push_subscriptions").select("user_id");
    (r3 || []).forEach((r) => idsSet.add(r.user_id));
    const userIds = Array.from(idsSet);

    for (const userId of userIds) {
      // custom reminders
      const { data: rows } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", userId)
        .eq("enabled", true);

      for (const row of rows || []) {
        if (!isCustomDue(toReminder(row), now)) continue;
        // mark fired
        await supabase
          .from("reminders")
          .update({ last_fired_at: now.toISOString() })
          .eq("id", row.id)
          .eq("user_id", userId);

        const payload = {
          title: "Waktunya minum",
          body: "Sudah waktunya minum air ya, jangan sampai dehidrasi.",
          tag: `custom-${row.id}-${now.toISOString().slice(0,10)}`,
          url: "/reminder"
        };

        const { data: subs } = await supabase
          .from("push_subscriptions")
          .select("*")
          .eq("user_id", userId);

        for (const sub of subs || []) {
          if (!sub?.p256dh || !sub?.auth || !sub?.endpoint) continue;
          try {
            await sendPush(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              payload
            );
          } catch (e) {
            const status = e?.statusCode || e?.status;
            if (status === 410 || status === 404) {
              await supabase.from("push_subscriptions").delete().eq("id", sub.id);
            }
          }
        }

        await supabase.from("reminder_history").insert({
          user_id: userId,
          source: "custom",
          time: row.time,
          title: payload.title,
          message: payload.body,
          fired_at: now.toISOString(),
        });
      }

      // auto
      const { data: autoRow } = await supabase
        .from("auto_reminders")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      const auto = autoRow ? toAuto(autoRow) : DEFAULT_AUTO;
      if (isAutoDue(auto, now)) {
        await supabase
          .from("auto_reminders")
          .update({ last_fired_at: now.toISOString() })
          .eq("user_id", userId);

        const payload = {
          title: "Waktunya minum",
          body: `Auto reminder: minum setiap ${auto.intervalMinutes} menit antara ${auto.startTime} - ${auto.endTime}.`,
          tag: `auto-${now.toISOString().slice(0,10)}-${now.getHours()}${now.getMinutes()}`,
          url: "/reminder"
        };

        const { data: subs } = await supabase
          .from("push_subscriptions")
          .select("*")
          .eq("user_id", userId);

        for (const sub of subs || []) {
          if (!sub?.p256dh || !sub?.auth || !sub?.endpoint) continue;
          try {
            await sendPush(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              payload
            );
          } catch (e) {
            const status = e?.statusCode || e?.status;
            if (status === 410 || status === 404) {
              await supabase.from("push_subscriptions").delete().eq("id", sub.id);
            }
          }
        }

        await supabase.from("reminder_history").insert({
          user_id: userId,
          source: "auto",
          time: now.toTimeString().slice(0, 5),
          title: payload.title,
          message: payload.body,
          fired_at: now.toISOString(),
        });
      }
    }
  } catch (e) {
    console.error("push job error", e);
  }
};

module.exports = { runReminderPushJob };
