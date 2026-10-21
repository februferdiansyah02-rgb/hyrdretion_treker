import { reminderApi } from "./api";

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    return registration;
  } catch (e) {
    console.error("SW register failed", e);
    return null;
  }
};

const isBraveBrowser = async () => {
  try {
    if (navigator.brave?.isBrave) return await navigator.brave.isBrave();
  } catch {
    /* ignore */
  }
  return false;
};

// Chrome Android nggak mengizinkan `new Notification()` — harus lewat service worker.
export const showLocalNotification = async (title, options = {}) => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, options);
      return true;
    } catch (e) {
      console.error("showNotification via SW gagal", e);
    }
  }
  try {
    if ("Notification" in window && window.Notification.permission === "granted") {
      new window.Notification(title, options);
      return true;
    }
  } catch (e) {
    console.error("new Notification gagal", e);
  }
  return false;
};

export const subscribeToPush = async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { ok: false, reason: "unsupported" };
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      const { publicKey } = await reminderApi.getVapidPublicKey();
      if (!publicKey) return { ok: false, reason: "no-vapid" };
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }
    await reminderApi.savePushSubscription(subscription.toJSON());
    return { ok: true };
  } catch (e) {
    console.error("push subscribe failed", e);
    if (await isBraveBrowser()) {
      return {
        ok: false,
        reason:
          "Brave memblokir push secara default. Buka brave://settings/privacy, aktifkan 'Use Google services for push messaging', lalu tutup dan buka ulang Brave.",
      };
    }
    return { ok: false, reason: e.message };
  }
};
