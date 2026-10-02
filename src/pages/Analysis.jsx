import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Droplet,
    RefreshCw,
    Download,
    Sparkles,
    FileText,
    CheckCircle2,
    Loader2,
    ChevronDown,
    Plus,
} from "lucide-react";
import logo from "../assets/analysis.jpg";

import { drinksApi, notesApi } from "../lib/api";
import {
    dayKey,
    formatLiter,
    parseDrinks,
    buildDailyTotals,
    getTodayTotal,
    buildWeekly,
    getMonthTotal,
    getStreak,
    getDaysElapsed,
    getPeriodSummary,
    getInsight,
} from "../lib/hydrationStats";

const DEFAULT_GOAL = 2000;

const PERIODS = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
];

const RADIUS = 65;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const formatTime = (value) =>
    new Date(value).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    });

const NOTE_ICONS = {
    drop: Droplet,
    progress: Sparkles,
    morning: FileText,
    great: CheckCircle2,
    goal: CheckCircle2,
};

export default function Analysis({ onOpenNotes }) {
    const [drinks, setDrinks] = useState([]);
    const [notes, setNotes] = useState([]);
    const [goal, setGoal] = useState(DEFAULT_GOAL);
    const [period, setPeriod] = useState("daily");
    const [showPeriodMenu, setShowPeriodMenu] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updatedAt, setUpdatedAt] = useState(null);
    const [feedback, setFeedback] = useState(null);

    const notify = useCallback((message, tone = "success") => {
        setFeedback({ message, tone });
        setTimeout(() => setFeedback(null), 4000);
    }, []);

    const loadData = useCallback(
        async ({ silent = false } = {}) => {
            if (silent) setRefreshing(true);

            try {
                const [drinkList, noteList] = await Promise.all([
                    drinksApi.list(),
                    notesApi.list(),
                ]);

                setDrinks(drinkList);
                setNotes(noteList);
                setUpdatedAt(new Date());
            } catch (error) {
                notify(error.message, "error");
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [notify]
    );

    useEffect(() => {
        const savedGoal = Number(localStorage.getItem("waterGoal"));
        if (savedGoal > 0) setGoal(savedGoal);

        loadData();
    }, [loadData]);

    const validDrinks = useMemo(() => parseDrinks(drinks), [drinks]);

    const totalsByDay = useMemo(() => buildDailyTotals(validDrinks), [validDrinks]);

    const todayTotal = getTodayTotal(totalsByDay);

    const weekly = useMemo(() => buildWeekly(totalsByDay), [totalsByDay]);

    const monthTotal = useMemo(() => getMonthTotal(validDrinks), [validDrinks]);

    const daysElapsed = getDaysElapsed();

    const streak = useMemo(() => getStreak(totalsByDay, goal), [totalsByDay, goal]);

    const periodMeta = useMemo(
        () =>
            getPeriodSummary(period, {
                todayTotal,
                weekly,
                monthTotal,
                goal,
                daysElapsed,
            }),
        [period, todayTotal, weekly, monthTotal, goal, daysElapsed]
    );

    const progress = Math.min(
        (periodMeta.total / (periodMeta.target || 1)) * 100,
        100
    );

    const recentNotes = notes.slice(0, 3);

    const exportReport = () => {
        if (validDrinks.length === 0) {
            return notify("Belum ada data untuk diekspor", "error");
        }

        const header = "Date,Time,Amount (ml)\n";
        const rows = validDrinks
            .slice()
            .sort((a, b) => a.date - b.date)
            .map(
                (drink) =>
                    `${dayKey(drink.date)},${drink.date.toTimeString().slice(0, 5)},${
                        drink.amount
                    }`
            )
            .join("\n");

        const blob = new Blob([header + rows], {
            type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `hydration-report-${dayKey(new Date())}.csv`;
        link.click();

        URL.revokeObjectURL(url);
        notify("Report berhasil diunduh");
    };

    return (
        <div className="w-full max-w-7xl mx-auto">

            {/* Hero */}
            <div className="relative overflow-hidden bg-sky-400 rounded-3xl p-6 sm:p-8 text-white mb-6">
                <div className="absolute -right-20 -top-28 w-72 h-72 rounded-full bg-white/10" />
                <div className="absolute right-10 -bottom-32 w-64 h-64 rounded-full bg-white/10" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                            {period === "monthly" ? "Monthly" : period === "weekly" ? "Weekly" : "Today's"}
                            <br />
                            Progress
                        </h1>

                        <p className="text-white/80 text-sm sm:text-base mt-3 max-w-2xl">
                            {periodMeta.total === 0
                                ? "Belum ada air tercatat, mulai sekarang supaya statistiknya terisi."
                                : `You have logged ${formatLiter(
                                      periodMeta.total
                                  )} this ${periodMeta.label.toLowerCase()} out of ${formatLiter(
                                      periodMeta.target
                                  )} target.`}
                        </p>

                        <div className="flex flex-wrap gap-3 mt-5">
                            <button
                                onClick={() => loadData({ silent: true })}
                                disabled={refreshing}
                                className="flex items-center gap-2 bg-white text-sky-400 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-sky-50 transition disabled:opacity-60"
                            >
                                {refreshing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-4 h-4" />
                                )}
                                Refresh stats
                            </button>

                            <button
                                onClick={exportReport}
                                className="flex items-center gap-2 bg-white/10 border border-white/30 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-white/20 transition"
                            >
                                <Download className="w-4 h-4" />
                                Export report
                            </button>
                        </div>
                    </div>

                    <div className="relative shrink-0 bg-white/10 border border-white/20 rounded-3xl p-5 sm:p-6 min-w-[230px]">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold">Water Completed</p>

                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                                <Droplet className="w-5 h-5 text-sky-400 fill-sky-400" />
                            </div>
                        </div>

                        <p className="text-4xl sm:text-5xl font-extrabold mt-3">
                            {formatLiter(periodMeta.total)}
                            <span className="text-xl text-white/80 ml-2">
                                / {formatLiter(periodMeta.target)} goal
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard
                    title="Daily goal"
                    value={`${todayTotal}ml`}
                    subtitle="Completed today"
                    icon={<Droplet className="w-5 h-5 text-sky-400" />}
                />

                <StatCard
                    title="Weekly streak"
                    value={`${streak} ${streak === 1 ? "day" : "days"}`}
                    subtitle={streak > 0 ? "Keep it up" : "Log water to start a streak"}
                    icon={<Sparkles className="w-5 h-5 text-sky-400" />}
                />

                <StatCard
                    title="Monthly total"
                    value={formatLiter(monthTotal)}
                    subtitle="This month so far"
                    icon={<RefreshCw className="w-5 h-5 text-sky-400" />}
                />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

                {/* Left */}
                <div className="xl:col-span-2 flex flex-col gap-5">

                    {/* Daily Insight */}
                    <div className="bg-sky-50 border border-sky-100 rounded-3xl p-5">
                        <div className="flex items-center justify-between">
                            <h2 className="font-extrabold text-sky-500">
                                Daily insight
                            </h2>

                            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-sky-400" />
                            </div>
                        </div>

                        <p className="text-sm text-slate-400 mt-4">
                            {getInsight(todayTotal, goal)}
                        </p>

                        <p className="flex items-center gap-2 text-xs text-slate-400 mt-4">
                            <span className="w-2 h-2 rounded-full bg-sky-400" />
                            {updatedAt
                                ? `Updated ${updatedAt.toLocaleTimeString("en-US", {
                                      hour: "numeric",
                                      minute: "2-digit",
                                  })}`
                                : "Waiting for data"}
                        </p>
                    </div>

                    {/* Progress Overview */}
                    <div className="bg-white border border-sky-100 rounded-3xl p-5 sm:p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6 relative">
                            <h2 className="text-lg sm:text-xl font-extrabold text-slate-700">
                                Progress overview
                            </h2>

                            <div className="relative">
                                <button
                                    onClick={() => setShowPeriodMenu((prev) => !prev)}
                                    className="flex items-center gap-1 bg-sky-50 text-sky-400 px-3 py-2 rounded-xl text-xs font-bold hover:bg-sky-100 transition"
                                >
                                    {PERIODS.find((item) => item.value === period).label}
                                    <ChevronDown className="w-4 h-4" />
                                </button>

                                {showPeriodMenu && (
                                    <div className="absolute right-0 top-11 z-20 w-32 bg-white border border-sky-100 rounded-2xl shadow-lg p-1.5">
                                        {PERIODS.map((item) => (
                                            <button
                                                key={item.value}
                                                onClick={() => {
                                                    setPeriod(item.value);
                                                    setShowPeriodMenu(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition ${
                                                    period === item.value
                                                        ? "bg-sky-50 text-sky-400"
                                                        : "text-slate-400 hover:bg-sky-50"
                                                }`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center gap-3 py-12 text-slate-400">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-sm font-semibold">Loading stats...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row items-center gap-7">

                                {/* Circle */}
                                <div className="relative w-40 h-40 shrink-0">
                                    <svg
                                        className="w-full h-full -rotate-90"
                                        viewBox="0 0 160 160"
                                    >
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r={RADIUS}
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="14"
                                            className="text-sky-100"
                                        />

                                        <circle
                                            cx="80"
                                            cy="80"
                                            r={RADIUS}
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="14"
                                            strokeLinecap="round"
                                            className="text-sky-400 transition-all duration-500"
                                            strokeDasharray={CIRCUMFERENCE}
                                            strokeDashoffset={
                                                CIRCUMFERENCE -
                                                (progress / 100) * CIRCUMFERENCE
                                            }
                                        />
                                    </svg>

                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-extrabold text-sky-400">
                                            {Math.round(progress)}%
                                        </span>

                                        <span className="text-xs text-slate-400">
                                            {periodMeta.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="flex-1 w-full">
                                    <p className="text-3xl font-extrabold text-sky-400">
                                        {formatLiter(periodMeta.total)}
                                    </p>

                                    <p className="text-sm text-slate-400">
                                        Water Completed
                                    </p>

                                    <div className="w-full h-3 bg-sky-100 rounded-full mt-5 overflow-hidden">
                                        <div
                                            className="h-full bg-sky-400 rounded-full transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>

                                    <div className="flex justify-between text-xs text-slate-400 mt-2">
                                        <span>Goal</span>

                                        <span className="text-sky-400 font-bold">
                                            {formatLiter(periodMeta.target)} target
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recent Notes */}
                    <div className="bg-white border border-sky-100 rounded-3xl p-5 sm:p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg sm:text-xl font-extrabold text-slate-700">
                                Recent notes
                            </h2>

                            <button
                                onClick={onOpenNotes}
                                className="text-sm font-bold text-sky-400 hover:text-sky-500 transition"
                            >
                                View all
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center gap-3 py-8 text-slate-400">
                                <Loader2 className="w-5 h-5 animate-spin" />
                            </div>
                        ) : recentNotes.length === 0 ? (
                            <div className="border-2 border-dashed border-slate-100 rounded-2xl p-8 text-center">
                                <FileText className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm font-bold text-slate-400">
                                    Belum ada note
                                </p>
                                <button
                                    onClick={onOpenNotes}
                                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-500 transition"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Tulis note pertama
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {recentNotes.map((note) => {
                                    const NoteIcon = NOTE_ICONS[note.icon] || FileText;

                                    return (
                                        <div
                                            key={note.id}
                                            className="flex items-center gap-4 bg-sky-50/60 rounded-2xl p-4"
                                        >

                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                                                <NoteIcon className="w-5 h-5 text-sky-400" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-bold text-slate-700 truncate">
                                                    {note.title}
                                                </p>

                                                <p className="text-xs text-slate-400 mt-1 truncate">
                                                    {note.message}
                                                </p>
                                            </div>

                                            <span className="shrink-0 text-[10px] font-medium text-slate-300">
                                                {formatTime(note.createdAt)}
                                            </span>

                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right */}
                <div className="flex flex-col gap-0">

                    {/* Daily Visual */}
                    <div className="relative h-80 overflow-hidden rounded-t-3xl border border-sky-100 bg-white">

                        <img
                            src={logo}
                            alt="Hydration character"
                            className="absolute inset-0 w-full h-full object-contain"
                        />

                        {/* Gradasi */}
                        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white via-white/70 to-transparent pointer-events-none" />
                    </div>

                    {/* Weekly Summary */}
                    <div className="bg-white border-x border-b border-sky-100 rounded-b-3xl p-5 shadow-sm">

                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-extrabold text-slate-700">
                                Weekly summary
                            </h2>

                            <span className="bg-sky-50 text-sky-400 px-3 py-2 rounded-xl text-xs font-bold">
                                Last 7 days
                            </span>
                        </div>

                        <div className="flex flex-col gap-4">
                            {weekly.map((item) => (
                                <div
                                    key={item.key}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <span className="text-slate-400">
                                        {item.label}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`w-2 h-2 rounded-full ${
                                                item.value >= goal ? "bg-sky-400" : "bg-slate-200"
                                            }`}
                                        />

                                        <span
                                            className={`font-bold ${
                                                item.value >= goal
                                                    ? "text-sky-400"
                                                    : "text-slate-400"
                                            }`}
                                        >
                                            {formatLiter(item.value)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 pt-4 border-t border-sky-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400">
                                Weekly average
                            </span>

                            <span className="text-sm font-extrabold text-sky-400">
                                {formatLiter(
                                    Math.round(
                                        weekly.reduce((sum, day) => sum + day.value, 0) / 7
                                    )
                                )}
                            </span>
                        </div>
                    </div>

                </div>
            </div>

            {/* FEEDBACK */}
            {feedback && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[110]">
                    <div
                        className={`px-5 py-3 rounded-xl shadow-lg text-sm font-bold text-white ${
                            feedback.tone === "error" ? "bg-red-400" : "bg-sky-400"
                        }`}
                    >
                        {feedback.message}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ title, value, subtitle, icon }) {
    return (
        <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="font-bold text-slate-700">
                    {title}
                </p>

                <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
                    {icon}
                </div>
            </div>

            <p className="text-3xl font-extrabold text-sky-400 mt-4">
                {value}
            </p>

            <p className="text-xs text-slate-400 mt-2">
                {subtitle}
            </p>
        </div>
    );
}