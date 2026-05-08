import { useMemo, useState } from "react";
import { Flame, Trophy, Play, Zap, Coffee, Check } from "lucide-react";
import { storage, todayStr, todayStatus, saveWorkout } from "@/lib/gym-storage";
import { MOTIVATION_QUOTES } from "@/lib/motivation";
import { QuickLogModal } from "./QuickLogModal";

interface Props {
  goToLog: () => void;
  onChange: () => void;
  onMilestone: (n: number) => void;
}

export function TodayTab({ goToLog, onChange, onMilestone }: Props) {
  const stats = storage.getStats();
  const settings = storage.getSettings();
  const status = todayStatus();
  const workouts = storage.getWorkouts();
  const todaysWorkout = workouts.find((w) => w.date === todayStr() && !w.isRest);
  const minutesToday = workouts
    .filter((w) => w.date === todayStr() && !w.isRest)
    .reduce((s, w) => s + w.duration, 0);
  const goalHit = minutesToday >= settings.minWorkoutMinutes;

  const [quickOpen, setQuickOpen] = useState(false);

  const quote = useMemo(() => {
    const day = new Date();
    const idx = (day.getFullYear() * 1000 + day.getMonth() * 50 + day.getDate()) %
      MOTIVATION_QUOTES.length;
    return MOTIVATION_QUOTES[idx];
  }, []);

  const handleRest = () => {
    if (status !== "none") return;
    const res = saveWorkout({
      type: "Rest",
      duration: 0,
      effort: "Easy",
      exercises: [],
      isRest: true,
    });
    if (res.newMilestone) onMilestone(res.newMilestone);
    onChange();
  };

  const statusLabel =
    status === "workout" ? "Workout completed" : status === "rest" ? "Rest day" : "Not started";

  return (
    <div className="px-5 pt-8 pb-6 space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Gym Habit</p>
          <h1 className="text-2xl font-black">Today</h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase text-muted-foreground">Level {stats.level}</p>
          <p className="text-sm font-bold text-primary">{(stats.totalXP % 100)}/100 XP</p>
        </div>
      </header>

      {/* Streak Hero */}
      <div className="rounded-3xl p-6 gradient-primary shadow-glow text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold opacity-80">Current Streak</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-6xl font-black tabular-nums">{stats.currentStreak}</span>
              <Flame className="h-8 w-8" />
            </div>
            <p className="text-sm font-medium mt-1 opacity-90">days strong</p>
          </div>
          <div className="text-right">
            <Trophy className="h-6 w-6 ml-auto" />
            <p className="text-xs uppercase mt-2 opacity-80">Longest</p>
            <p className="text-2xl font-black">{stats.longestStreak}</p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/20">
          <p className="text-xs uppercase opacity-80">Today</p>
          <p className="text-lg font-bold">{statusLabel}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={goToLog}
          className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Play className="h-5 w-5 fill-current" /> Start Workout
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setQuickOpen(true)}
            className="bg-card text-foreground font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 border border-border active:scale-[0.98] transition-transform"
          >
            <Zap className="h-4 w-4 text-primary" /> Quick Log
          </button>
          <button
            onClick={handleRest}
            disabled={status !== "none"}
            className="text-muted-foreground font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 border border-border active:scale-[0.98] transition-transform disabled:opacity-40"
          >
            <Coffee className="h-4 w-4" /> Rest Today
          </button>
        </div>
      </div>

      {/* Daily Micro Goal */}
      <div className="rounded-2xl bg-card p-5 border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-muted-foreground tracking-wide">
              Daily Micro Goal
            </p>
            <p className="text-lg font-bold mt-1">
              {settings.minWorkoutMinutes} minutes today
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {minutesToday} / {settings.minWorkoutMinutes} min
            </p>
          </div>
          {goalHit ? (
            <div className="bg-success/20 text-success px-3 py-2 rounded-xl flex items-center gap-1 font-bold text-sm">
              <Check className="h-4 w-4" /> Done
            </div>
          ) : (
            <div className="text-primary text-2xl font-black">
              {Math.max(0, settings.minWorkoutMinutes - minutesToday)}m
            </div>
          )}
        </div>
        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-primary transition-all"
            style={{
              width: `${Math.min(100, (minutesToday / settings.minWorkoutMinutes) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Calendar Chain */}
      <CalendarChain />

      {/* Identity quote */}
      <div className="rounded-2xl bg-card p-5 border border-border text-center">
        <p className="text-xs uppercase text-muted-foreground tracking-widest">Identity</p>
        <p className="mt-2 text-xl font-bold text-gradient-primary">{quote}</p>
      </div>

      {quickOpen && (
        <QuickLogModal
          onClose={() => setQuickOpen(false)}
          onSaved={(m) => {
            setQuickOpen(false);
            if (m) onMilestone(m);
            onChange();
          }}
        />
      )}
    </div>
  );
}

function CalendarChain() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const workouts = storage.getWorkouts();

  const byDate = new Map<string, "workout" | "rest">();
  for (const w of workouts) {
    if (w.isRest) {
      if (!byDate.has(w.date)) byDate.set(w.date, "rest");
    } else {
      byDate.set(w.date, "workout");
    }
  }

  const cells: Array<{ day: number | null; status: "workout" | "rest" | "missed" | "future" | "blank" }> = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: null, status: "blank" });
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dDate = new Date(year, month, d);
    let status: "workout" | "rest" | "missed" | "future" | "blank" = "missed";
    if (dDate > today) status = "future";
    if (byDate.get(ds) === "workout") status = "workout";
    else if (byDate.get(ds) === "rest") status = "rest";
    cells.push({ day: d, status });
  }

  const monthName = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="rounded-2xl bg-card p-5 border border-border">
      <div className="flex items-center justify-between mb-3">
        <p className="font-bold">{monthName}</p>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" /> Workout</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning" /> Rest</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted" /> Miss</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] text-muted-foreground font-semibold">
            {d}
          </div>
        ))}
        {cells.map((c, i) => {
          if (c.day === null)
            return <div key={i} className="aspect-square" />;
          const cls =
            c.status === "workout"
              ? "bg-success/80 text-success-foreground"
              : c.status === "rest"
                ? "bg-warning/70 text-background"
                : c.status === "future"
                  ? "bg-muted/30 text-muted-foreground"
                  : "bg-muted/60 text-muted-foreground";
          const isToday = c.day === today.getDate();
          return (
            <div
              key={i}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold ${cls} ${
                isToday ? "ring-2 ring-primary" : ""
              }`}
            >
              {c.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
