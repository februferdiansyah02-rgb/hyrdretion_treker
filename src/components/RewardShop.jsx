import { useEffect, useRef, useState } from "react";
import { Gift, Ticket, Loader2, Coffee, Utensils } from "lucide-react";
import { rewardsApi } from "../lib/api";
import { useAuth } from "../context/useAuth";

export default function RewardShop({ balance, onRedeemed }) {
  const { user } = useAuth();

  const [catalog, setCatalog] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const redeemLock = useRef(false);

  const loadShop = async () => {
    const [items, voucherList] = await Promise.all([
      rewardsApi.catalog(),
      rewardsApi.vouchers(),
    ]);

    setCatalog(items);
    setVouchers(voucherList);
  };

  const reloadShop = async () => {
    setLoading(true);
    setError("");

    try {
      await loadShop();
    } catch (err) {
      setError(err.message || "Unable to load rewards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setCatalog([]);
    setVouchers([]);
    setMessage("");
    setError("");

    Promise.all([
      rewardsApi.catalog(),
      rewardsApi.vouchers(),
    ])
      .then(([items, voucherList]) => {
        if (cancelled) return;
        setCatalog(items);
        setVouchers(voucherList);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Unable to load rewards.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleRedeem = async (reward) => {
    if (redeemLock.current || !user?.id) return;

    const storageKey = `reward-request:${user.id}:${reward.id}`;

    setMessage("");
    setError("");

    redeemLock.current = true;
    setRedeemingId(reward.id);

    let result;

    try {
      // Simpan ID agar retry setelah koneksi putus memakai request yang sama.
      let requestId = sessionStorage.getItem(storageKey);

      if (!requestId) {
        if (balance < reward.points_cost) {
          setError("Poin kamu belum cukup.");
          return;
        }

        if (reward.stock <= 0) {
          setError("Stok hadiah sudah habis.");
          return;
        }

        const confirmed = window.confirm(
          `Tukar ${reward.points_cost} poin untuk ${reward.name}?\n\n` +
            "Ini voucher simulasi, tidak berlaku untuk pembelian nyata."
        );

        if (!confirmed) return;

        requestId = crypto.randomUUID();
        sessionStorage.setItem(storageKey, requestId);
      }

      result = await rewardsApi.redeem(reward.id, requestId);
    } catch (err) {
      setError(
        `${err.message || "Penukaran belum dapat dikonfirmasi."} ` +
          "Klik hadiah yang sama untuk mencoba lagi."
      );
      return;
    } finally {
      redeemLock.current = false;
      setRedeemingId(null);
    }

    // Respons berhasil: request ini selesai.
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // Jika gagal dibersihkan, retry tetap memakai request lama yang aman.
    }

    setMessage(
      result.alreadyProcessed
        ? "Penukaran ini sudah diproses. Voucher sebelumnya ditampilkan."
        : `Berhasil menukar ${result.voucher.reward_name}!`
    );

    // Tampilkan voucher langsung, termasuk jika refresh berikutnya gagal.
    setVouchers((previous) => [
      result.voucher,
      ...previous.filter((item) => item.id !== result.voucher.id),
    ]);

    try {
      await onRedeemed?.(result.balance);
      await loadShop();
    } catch {
      setError(
        "Voucher sudah berhasil dibuat, tetapi tampilan belum sepenuhnya diperbarui. Muat ulang halaman."
      );
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          role="status"
          className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-2xl bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-sky-100 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <Gift className="h-6 w-6 text-sky-500" />
            Reward Catalog
          </h2>

          <button
            type="button"
            onClick={reloadShop}
            disabled={loading || redeemingId !== null}
            className="text-sm font-bold text-sky-600 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Exchange your points for simulated food and drink vouchers.
        </p>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-7 w-7 animate-spin text-sky-500" />
          </div>
        ) : catalog.length === 0 ? (
          <p className="mt-5 text-sm text-slate-400">
            No rewards available.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {catalog.map((reward) => {
              const Icon = reward.category === "drink" ? Coffee : Utensils;
              const isRedeeming = redeemingId === reward.id;

              return (
                <div
                  key={reward.id}
                  className="rounded-2xl border border-slate-100 p-5"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50">
                    <Icon className="h-6 w-6 text-sky-500" />
                  </div>

                  <h3 className="font-bold text-slate-800">
                    {reward.name}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    {reward.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="font-bold text-sky-600">
                      {reward.points_cost} points
                    </span>
                    <span className="text-xs text-slate-400">
                      Stock: {reward.stock}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRedeem(reward)}
                    disabled={redeemingId !== null || !user?.id}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 font-bold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isRedeeming ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Tukar"
                    )}
                  </button>

                  {balance < reward.points_cost && (
                    <p className="mt-2 text-xs text-slate-400">
                      Butuh {reward.points_cost - balance} poin lagi.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-sky-100 bg-white p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
          <Ticket className="h-6 w-6 text-sky-500" />
          My Vouchers
        </h2>

        {vouchers.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            Your redeemed vouchers will appear here.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {vouchers.map((voucher) => (
              <div
                key={voucher.id}
                className="rounded-2xl border border-dashed border-sky-300 bg-sky-50 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-800">
                    {voucher.reward_name}
                  </h3>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-600">
                    {voucher.status === "used" ? "Used" : "Available"}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  {voucher.points_spent} points exchanged
                </p>

                <p className="mt-4 text-xs font-semibold text-slate-500">
                  Voucher code
                </p>

                <code className="mt-1 block break-all rounded-xl bg-white p-3 text-sm text-slate-700">
                  {voucher.voucher_code}
                </code>

                <p className="mt-3 text-xs text-slate-400">
                  {new Date(voucher.created_at).toLocaleString("id-ID", {
                    timeZone: "Asia/Jakarta",
                  })}{" "}
                  WIB
                </p>

                <p className="mt-2 text-xs font-semibold text-amber-700">
                  SIMULASI — tidak berlaku untuk pembelian nyata.
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}