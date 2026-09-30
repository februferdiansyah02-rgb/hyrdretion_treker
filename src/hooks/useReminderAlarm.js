import { useCallback, useEffect, useRef, useState } from "react";

import { reminderApi } from "../lib/api";
import { playReminderSound, unlockAudio } from "../lib/reminderSound";

const POLL_INTERVAL = 15000;
const MAX_VISIBLE_ALERTS = 3;

const getPermission = () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return window.Notification.permission;
};

export default function useReminderAlarm() {
  const [alerts, setAlerts] = useState([]);
  const [permission, setPermission] = useState(getPermission);
  const permissionRef = useRef(permission);

  useEffect(() => {
    permissionRef.current = permission;
  }, [permission]);

  const dismiss = useCallback((uid) => {
    setAlerts((prev) => prev.filter((alert) => alert.uid !== uid));
  }, []);

  const dismissAll = useCallback(() => {
    setAlerts([]);
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }

    const result = await window.Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const checkDue = useCallback(async () => {
    try {
      const data = await reminderApi.due();

      if (!data?.dueCount) return;

      const fired = data.reminders.map((reminder) => ({
        ...reminder,
        uid: `${reminder.source}-${reminder.id ?? "auto"}-${data.checkedAt}`,
        firedAt: data.checkedAt,
      }));

      setAlerts((prev) => [...prev, ...fired].slice(-MAX_VISIBLE_ALERTS));

      playReminderSound();

      if (permissionRef.current === "granted") {
        fired.forEach((reminder) => {
          new window.Notification(reminder.title, {
            body: reminder.message,
            tag: reminder.uid,
          });
        });
      }
    } catch (error) {
      console.error("Gagal checking pengingat:", error);
    }
  }, []);

  useEffect(() => {
    checkDue();

    const timer = setInterval(checkDue, POLL_INTERVAL);

    return () => clearInterval(timer);
  }, [checkDue]);

  useEffect(() => {
    const handleUnlock = () => unlockAudio();

    window.addEventListener("pointerdown", handleUnlock, { once: true });
    window.addEventListener("keydown", handleUnlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleUnlock);
      window.removeEventListener("keydown", handleUnlock);
    };
  }, []);

  return {
    alerts,
    dismiss,
    dismissAll,
    permission,
    requestPermission,
    checkDue,
  };
}
