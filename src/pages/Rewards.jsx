import { useEffect, useRef, useState } from "react";
import { Gift, Coins, Flame, Check, Loader2 } from "lucide-react";
import { rewardsApi } from "../lib/api";
import RewardShop from "../components/RewardShop";

export default function Rewards() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const claimLock = useRef(false);

  const loadSummary = async () => {
    setError("");

    try {
      const data = await rewardsApi.summary();
      setSummary(data);
    } catch (err) {
      setError(err.message || "Unable to load rewards.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleCheckIn = async () => {
    if (claimLock.current || summary?.checkedInToday) return;

    claimLock.current = true;
    setClaiming(true);
    setMessage("");
    setError("");

    try {
      const result = await rewardsApi.checkIn();

      setSummary((previous) => ({
        ...previous,
        balance: result.balance,
        streak: result.streak,
        lastCheckin: result.lastCheckin,
        today: result.today,
        checkedInToday: true,
      }));

      setMessage(
        result.claimed
          ? `Check-in successful! You earned ${result.pointsEarned} points.`
          : "You have already checked in today."
      );

      await loadSummary();
    } catch (err) {
      setError(err.message || "Check-in failed. Please try again.");
    } finally {
      claimLock.current = false;
      setClaiming(false);
    }
  };

  // Perbarui saldo setelah penukaran hadiah berhasil.
  const handleRedeemed = (newBalance) => {
    setSummary((previous) => ({
      ...previous,
      balance: newBalance,
    }));
  };

  const streak = summary?.streak ?? 0;

  const completedDays =
    streak > 0 && streak % 7 === 0 && summary?.checkedInToday
      ? 7
      : streak % 7;

  const history = summary?.history ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-extrabold text-slate-800">
          <Gift className="h-8 w-8 text-sky-500" />
          Rewards
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Check in daily, collect points, and build your streak.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-2xl bg-red-50 p-4 text-sm text-red-700"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={loadSummary}
            disabled={claiming}
            className="mt-2 font-bold underline disabled:opacity-50"
          >
            Reload rewards
          </button>
        </div>
      )}

      {message && (
        <div
          role="status"
          className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-sky-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          Loading rewards...
        </div>
      ) : summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-sky-500 p-6 text-white">
              <div className="flex items-center gap-2 text-sky-100">
                <Coins className="h-5 w-5" />
                My Points
              </div>
              <p className="mt-3 text-5xl font-extrabold">
                {summary.balance}
              </p>
              <p className="mt-2 text-sm text-sky-100">
                Keep checking in to collect more points.
              </p>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-orange-50 p-6">
              <div className="flex items-center gap-2 text-orange-600">
                <Flame className="h-5 w-5" />
                Current Streak
              </div>
              <p className="mt-3 text-5xl font-extrabold text-slate-800">
                {streak}
                <span className="ml-2 text-lg font-medium">days</span>
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Earn 30 bonus points every 7 consecutive days.
              </p>
            </div>
          </div>

          <section className="rounded-3xl border border-sky-100 bg-white p-6">
            <h2 className="text-xl font-bold text-slate-800">
              Daily Check-in
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Earn 10 points each day. Day 7 gives you 40 points in total!
            </p>

            <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-7">
              {Array.from({ length: 7 }, (_, index) => {
                const day = index + 1;
                const completed = day <= completedDays;

                return (
                  <div
                    key={day}
                    className={`rounded-2xl border p-3 text-center ${
                      completed
                        ? "border-sky-400 bg-sky-50 text-sky-700"
                        : "border-slate-100 bg-slate-50 text-slate-400"
                    }`}
                  >
                    <p className="text-xs font-semibold">Day {day}</p>

                    {completed ? (
                      <Check className="mx-auto my-3 h-6 w-6" />
                    ) : (
                      <Gift className="mx-auto my-3 h-6 w-6" />
                    )}

                    <p className="text-sm font-bold">
                      +{day === 7 ? 40 : 10}
                    </p>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleCheckIn}
              disabled={claiming || summary.checkedInToday}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-6 py-4 font-bold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              {claiming ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Checking in...
                </>
              ) : summary.checkedInToday ? (
                <>
                  <Check className="h-5 w-5" />
                  Checked in today
                </>
              ) : (
                "Check in — earn 10 points"
              )}
            </button>

            <p className="mt-3 text-center text-xs text-slate-400">
              Resets at 00:00 WIB. Missing a day resets your streak,
              but your points stay.
            </p>
          </section>

          <section className="rounded-3xl border border-sky-100 bg-white p-6">
            <h2 className="text-xl font-bold text-slate-800">
              Points History
            </h2>

            {history.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">
                No points yet. Start with your first check-in!
              </p>
            ) : (
              <div className="mt-4 divide-y divide-slate-100">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-700">
                        {item.kind === "streak_bonus"
                          ? "7-day streak bonus"
                          : "Daily check-in"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.event_date}
                      </p>
                    </div>

                    <span className="shrink-0 font-bold text-emerald-600">
                      +{item.points} points
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <RewardShop
            balance={summary.balance}
            onRedeemed={handleRedeemed}
          />
        </>
      ) : null}
    </div>
  );
}