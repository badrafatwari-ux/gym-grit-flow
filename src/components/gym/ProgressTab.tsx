import { useMemo } from "react";
import { storage, levelTitle, todayStr } from "@/lib/gym-storage";

export function ProgressTab() {
  const stats = storage.getStats();
  const workouts = storage.getWorkouts().filter((w) => !w.isRest);

  const monthly = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysSoFar = now.getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthWorkouts = new Set(
      workouts
        .filter((w) => w.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`))
        .map((w) => w.date),
    );
    const consistency = Math.round((monthWorkouts.size / daysSoFar) * 100);
    return { consistency, daysInMonth, daysSoFar, count: monthWorkouts.size };
  }, [workouts]);

  // workouts per week (last 6 weeks)
  const perWeek = useMemo(() => {
    const buckets: { label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay() - i * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const startStr = todayStr(start);
      const endStr = todayStr(end);
      const count = workouts.filter((w) => w.date >= startStr && w.date <= endStr).length;
      buckets.push({ label: `${start.getMonth() + 1}/${start.getDate()}`, count });
    }
    return buckets;
  }, [workouts]);

  // minutes per month (last 6 months)
  const perMonth = useMemo(() => {
    const buckets: { label: string; minutes: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const minutes = workouts
        .filter((w) => w.date.startsWith(key))
        .reduce((s, w) => s + w.duration, 0);
      buckets.push({
        label: d.toLocaleDateString("en", { month: "short" }),
        minutes,
      });
    }
    return buckets;
  }, [workouts]);

  const xpInLevel = stats.totalXP % 100;
  const maxWeek = Math.max(1, ...perWeek.map((b) => b.count));
  const maxMonth = Math.max(1, ...perMonth.map((b) => b.minutes));

  return (
    <div className="px-5 pt-8 pb-6 space-y-5">
      <h1 className="text-2xl font-black">Progress</h1>

      {/* Level card */}
      <div className="rounded-3xl gradient-primary p-6 text-primary-foreground shadow-glow">
        <p className="text-xs uppercase opacity-80 font-bold tracking-widest">Level {stats.level}</p>
        <p className="text-3xl font-black mt-1">{levelTitle(stats.level)}</p>
        <div className="mt-4 h-3 bg-black/20 rounded-full overflow-hidden">
          <div className="h-full bg-white" style={{ width: `${xpInLevel}%` }} />
        </div>
        <p className="text-xs mt-2 opacity-90 font-semibold">
          {xpInLevel}/100 XP to {levelTitle(stats.level + 1)}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Workouts" value={stats.totalWorkouts} />
        <StatCard label="Hours Trained" value={Math.round((stats.totalMinutes / 60) * 10) / 10} />
        <StatCard label="Current Streak" value={stats.currentStreak} suffix="🔥" />
        <StatCard label="Longest Streak" value={stats.longestStreak} suffix="🏆" />
      </div>

      <div className="rounded-2xl bg-card p-5 border border-border">
        <p className="text-xs uppercase text-muted-foreground font-bold tracking-wide">
          Monthly Consistency
        </p>
        <p className="text-4xl font-black text-primary mt-1">{monthly.consistency}%</p>
        <p className="text-xs text-muted-foreground mt-1">
          {monthly.count} of {monthly.daysSoFar} days this month
        </p>
        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full gradient-primary" style={{ width: `${Math.min(100, monthly.consistency)}%` }} />
        </div>
      </div>

      {/* Workouts per week */}
      <div className="rounded-2xl bg-card p-5 border border-border">
        <p className="text-sm font-bold mb-4">Workouts / Week</p>
        <div className="flex items-end justify-between gap-2 h-32">
          {perWeek.map((b, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="text-[10px] font-bold text-muted-foreground">{b.count}</div>
              <div
                className="w-full gradient-primary rounded-t-md min-h-1"
                style={{ height: `${(b.count / maxWeek) * 100}%` }}
              />
              <div className="text-[10px] text-muted-foreground">{b.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Minutes per month */}
      <div className="rounded-2xl bg-card p-5 border border-border">
        <p className="text-sm font-bold mb-4">Minutes / Month</p>
        <div className="flex items-end justify-between gap-2 h-32">
          {perMonth.map((b, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="text-[10px] font-bold text-muted-foreground">{b.minutes}</div>
              <div
                className="w-full bg-primary/70 rounded-t-md min-h-1"
                style={{ height: `${(b.minutes / maxMonth) * 100}%` }}
              />
              <div className="text-[10px] text-muted-foreground">{b.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="bg-card rounded-2xl p-4 border border-border">
      <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wide">{label}</p>
      <p className="text-3xl font-black mt-1">
        {value}
        {suffix && <span className="text-lg ml-1">{suffix}</span>}
      </p>
    </div>
  );
}
