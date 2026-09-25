import React from "react";
import {
    Droplet,
    RefreshCw,
    Download,
    Sparkles,
    FileText,
    CheckCircle2,
    Image as ImageIcon,
    ChevronDown,
} from "lucide-react";
import logo from "../assets/analysis.jpg";

export default function Analysis() {
    const dailyGoal = 2000;
    const waterCompleted = 500;
    const progress = Math.min((waterCompleted / dailyGoal) * 100, 100);

    const weeklyData = [
        { day: "Mon", value: "1.8L" },
        { day: "Tue", value: "1.9L" },
        { day: "Wed", value: "1.7L" },
        { day: "Thu", value: "2.0L" },
        { day: "Fri", value: "1.9L" },
        { day: "Sat", value: "1.8L" },
        { day: "Sun", value: "1.7L" },
    ];

    return (
        <div className="w-full max-w-7xl mx-auto">
            {/* Hero */}
            <div className="relative overflow-hidden bg-sky-400 rounded-3xl p-6 sm:p-8 text-white mb-6">
                <div className="absolute -right-20 -top-28 w-72 h-72 rounded-full bg-white/10" />
                <div className="absolute right-10 -bottom-32 w-64 h-64 rounded-full bg-white/10" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                            Today's
                            <br />
                            Progress
                        </h1>

                        <p className="text-white/80 text-sm sm:text-base mt-3 max-w-2xl">
                            You've completed your daily hydration goal and are on track for a
                            healthy week.
                        </p>

                        <div className="flex flex-wrap gap-3 mt-5">
                            <button className="flex items-center gap-2 bg-white text-sky-400 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-sky-50 transition">
                                <RefreshCw className="w-4 h-4" />
                                Refresh stats
                            </button>

                            <button className="flex items-center gap-2 bg-white/10 border border-white/30 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-white/20 transition">
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
                            {waterCompleted}ml
                            <span className="text-xl text-white/80 ml-2">
                                / {dailyGoal / 1000}L goal
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard
                    title="Daily goal"
                    value={`${waterCompleted}ml`}
                    subtitle="Completed today"
                    icon={<Droplet className="w-5 h-5 text-sky-400" />}
                />

                <StatCard
                    title="Weekly streak"
                    value="12 days"
                    subtitle="Keep it up"
                    icon={<Sparkles className="w-5 h-5 text-sky-400" />}
                />

                <StatCard
                    title="Monthly total"
                    value="18.4L"
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
                            <h2 className="font-extrabold text-sky-500">Daily insight</h2>

                            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-sky-400" />
                            </div>
                        </div>

                        <p className="text-sm text-slate-400 mt-4">
                            Hey, you're doing amazing!
                            <br />
                            Keep up the great work!
                        </p>

                        <p className="flex items-center gap-2 text-xs text-slate-400 mt-4">
                            <span className="w-2 h-2 rounded-full bg-sky-400" />
                            Updated 5 min ago
                        </p>
                    </div>

                    {/* Progress Overview */}
                    <div className="bg-white border border-sky-100 rounded-3xl p-5 sm:p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg sm:text-xl font-extrabold text-slate-700">
                                Progress overview
                            </h2>

                            <button className="flex items-center gap-1 bg-sky-50 text-sky-400 px-3 py-2 rounded-xl text-xs font-bold">
                                Daily
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-7">
                            {/* Circle */}
                            <div className="relative w-40 h-40 shrink-0">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="65"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="14"
                                        className="text-sky-100"
                                    />

                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="65"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="14"
                                        strokeLinecap="round"
                                        className="text-sky-400"
                                        strokeDasharray={`${2 * Math.PI * 65}`}
                                        strokeDashoffset={
                                            2 * Math.PI * 65 -
                                            (progress / 100) * (2 * Math.PI * 65)
                                        }
                                    />
                                </svg>

                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-extrabold text-sky-400">
                                        {waterCompleted}ml
                                    </span>

                                    <span className="text-xs text-slate-400">
                                        Water Completed
                                    </span>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="flex-1 w-full">
                                <p className="text-3xl font-extrabold text-sky-400">
                                    {waterCompleted}ml
                                </p>

                                <p className="text-sm text-slate-400">
                                    Water Completed
                                </p>

                                <div className="w-full h-3 bg-sky-100 rounded-full mt-5 overflow-hidden">
                                    <div
                                        className="h-full bg-sky-400 rounded-full"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>

                                <div className="flex justify-between text-xs text-slate-400 mt-2">
                                    <span>Goal</span>
                                    <span className="text-sky-400 font-bold">
                                        {dailyGoal / 1000}L target
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Notes */}
                    <div className="bg-white border border-sky-100 rounded-3xl p-5 sm:p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg sm:text-xl font-extrabold text-slate-700">
                                Recent notes
                            </h2>

                            <button className="text-sm font-bold text-sky-400">
                                View all
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            <NoteItem
                                icon={<FileText className="w-5 h-5 text-sky-400" />}
                                title="Post-workout hydration"
                                text="Drink an extra 250ml after your evening walk."
                            />

                            <NoteItem
                                icon={<CheckCircle2 className="w-5 h-5 text-sky-400" />}
                                title="Reminder"
                                text="Take a sip every hour until bedtime."
                            />
                        </div>
                    </div>
                </div>

                {/* Right */}
                <div className="flex flex-col gap-5">

                    {/* Daily Visual */}
                    <div className="relative h-72 bg-white border border-sky-100 rounded-3xl overflow-hidden shadow-sm">
                        <div className="absolute top-5 left-5 z-10 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl">
                            <ImageIcon className="w-5 h-5 text-sky-400" />

                            <span className="text-sm font-bold text-slate-700">
                                Daily visual
                            </span>
                        </div>

                        <img
                            src={logo}
                            alt="Hydration character"
                            className="absolute inset-0 w-full h-full object-contain"
                        />
                    </div>

                    {/* Weekly Summary */}
                    <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-extrabold text-slate-700">
                                Weekly summary
                            </h2>

                            <span className="bg-sky-50 text-sky-400 px-3 py-2 rounded-xl text-xs font-bold">
                                This week
                            </span>
                        </div>

                        <div className="flex flex-col gap-4">
                            {weeklyData.map((item) => (
                                <div
                                    key={item.day}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <span className="text-slate-400">{item.day}</span>

                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-sky-400" />
                                        <span className="font-bold text-sky-400">
                                            {item.value}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle, icon }) {
    return (
        <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="font-bold text-slate-700">{title}</p>

                <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
                    {icon}
                </div>
            </div>

            <p className="text-3xl font-extrabold text-sky-400 mt-4">
                {value}
            </p>

            <p className="text-xs text-slate-400 mt-2">{subtitle}</p>
        </div>
    );
}

function NoteItem({ icon, title, text }) {
    return (
        <div className="flex items-center gap-4 bg-sky-50/60 rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-sm font-bold text-slate-700">{title}</p>
                <p className="text-xs text-slate-400 mt-1">{text}</p>
            </div>
        </div>
    );
}