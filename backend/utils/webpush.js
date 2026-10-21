const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
});

const webpush = require("web-push");

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@hydration-tracker.app";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

const sendPush = async (subscription, payload) => {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload),
      {
        TTL: 60 * 60,
      }
    );
  } catch (err) {
    // Attach statusCode if available
    if (err?.statusCode) throw err;
    if (err?.body) {
      try {
        const body = typeof err.body === "string" ? JSON.parse(err.body) : err.body;
        if (body?.statusCode) err.statusCode = body.statusCode;
      } catch (_) {}
    }
    throw err;
  }
};

module.exports = { sendPush, webpush };
