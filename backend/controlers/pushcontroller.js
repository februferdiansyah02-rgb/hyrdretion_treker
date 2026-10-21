const supabase = require("../config/supabase");
const { sendPush } = require("../utils/webpush");

const getVapidPublicKey = (req, res) => {
  res.json({ data: { publicKey: process.env.VAPID_PUBLIC_KEY || "" } });
};

const saveSubscription = async (req, res) => {
  const { subscription } = req.body;
  if (!subscription?.endpoint) {
    return res.status(400).json({ message: "Subscription tidak valid" });
  }

  const endpoint = subscription.endpoint;
  const p256dh = subscription.keys?.p256dh;
  const auth = subscription.keys?.auth;

  if (!p256dh || !auth) {
    return res.status(400).json({ message: "Keys tidak lengkap" });
  }

  try {
    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          user_id: req.user.id,
          endpoint,
          p256dh,
          auth,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,endpoint" }
      );

    if (error) return res.status(500).json({ message: error.message });
    res.json({ message: "Berhasil subscribe push notification", data: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const testPush = async (req, res) => {
  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", req.user.id);

  if (error) return res.status(500).json({ message: error.message });
  if (!subs?.length) {
    return res
      .status(400)
      .json({ message: "Belum ada subscription. Klik Aktifkan Push dulu." });
  }

  const payload = {
    title: "Test push dari server",
    body: "Web Push sudah work. Sampai jumpa di jam minum berikutnya!",
    tag: "push-test",
    url: "/reminder",
  };

  let sent = 0;
  for (const sub of subs) {
    if (!sub?.p256dh || !sub?.auth || !sub?.endpoint) continue;
    try {
      await sendPush(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      );
      sent += 1;
    } catch (e) {
      const status = e?.statusCode || e?.status;
      if (status === 410 || status === 404) {
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      }
    }
  }

  if (!sent) {
    return res
      .status(500)
      .json({ message: "Gagal mengirim push. Coba Aktifkan Push lagi." });
  }

  res.json({ message: `Test push terkirim ke ${sent} perangkat`, data: true });
};

module.exports = { getVapidPublicKey, saveSubscription, testPush };
