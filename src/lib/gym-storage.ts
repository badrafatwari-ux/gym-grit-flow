// Local storage helpers + types for Gym Habit Builder

export type Effort = "Easy" | "Medium" | "Hard";

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface Workout {
  id: string;
  date: string; // YYYY-MM-DD
  type: string;
  duration: number;
  effort: Effort;
  exercises: Exercise[];
  isRest?: boolean;
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  totalMinutes: number;
  totalXP: number;
  level: number;
  lastWorkoutDate: string;
}

export interface Settings {
  weeklyTarget: number;
  minWorkoutMinutes: number;
  restDayCounts: boolean;
}

const KEYS = {
  stats: "ghb_user_stats",
  workouts: "ghb_workouts",
  settings: "ghb_settings",
  milestones: "ghb_milestones_seen",
};

export const defaultStats: UserStats = {
  currentStreak: 0,
  longestStreak: 0,
  totalWorkouts: 0,
  totalMinutes: 0,
  totalXP: 0,
  level: 0,
  lastWorkoutDate: "",
};

export const defaultSettings: Settings = {
  weeklyTarget: 3,
  minWorkoutMinutes: 20,
  restDayCounts: true,
};

const isBrowser = typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const v = localStorage.getItem(key);
    if (!v) return fallback;
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getStats: () => read<UserStats>(KEYS.stats, defaultStats),
  setStats: (s: UserStats) => write(KEYS.stats, s),
  getWorkouts: () => read<Workout[]>(KEYS.workouts, []),
  setWorkouts: (w: Workout[]) => write(KEYS.workouts, w),
  getSettings: () => read<Settings>(KEYS.settings, defaultSettings),
  setSettings: (s: Settings) => write(KEYS.settings, s),
  getMilestones: () => read<number[]>(KEYS.milestones, []),
  setMilestones: (m: number[]) => write(KEYS.milestones, m),
  resetAll: () => {
    if (!isBrowser) return;
    localStorage.removeItem(KEYS.stats);
    localStorage.removeItem(KEYS.workouts);
    localStorage.removeItem(KEYS.settings);
    localStorage.removeItem(KEYS.milestones);
  },
};

export function todayStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysBetween(a: string, b: string) {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

export const xpFor = (effort: Effort) =>
  effort === "Easy" ? 10 : effort === "Medium" ? 20 : 30;

export const LEVEL_TITLES = [
  "Beginner",
  "Builder",
  "Warrior",
  "Athlete",
  "Beast",
  "Machine",
];

export const levelTitle = (level: number) =>
  LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)];

export const MILESTONES = [3, 7, 14, 30, 60, 100];

export interface SaveResult {
  newMilestone?: number;
  stats: UserStats;
}

export function saveWorkout(
  partial: Omit<Workout, "id" | "date"> & { date?: string },
): SaveResult {
  const settings = storage.getSettings();
  const stats = storage.getStats();
  const workouts = storage.getWorkouts();
  const date = partial.date ?? todayStr();

  const workout: Workout = {
    id: crypto.randomUUID(),
    date,
    type: partial.type,
    duration: partial.duration,
    effort: partial.effort,
    exercises: partial.exercises ?? [],
    isRest: partial.isRest,
  };
  workouts.push(workout);
  storage.setWorkouts(workouts);

  // Streak logic
  if (stats.lastWorkoutDate === date) {
    // already logged today; still update totals
  } else if (!stats.lastWorkoutDate) {
    stats.currentStreak = 1;
  } else {
    const gap = daysBetween(stats.lastWorkoutDate, date);
    if (gap === 1) stats.currentStreak += 1;
    else if (gap > 1) {
      if (settings.restDayCounts) stats.currentStreak += 1;
      else stats.currentStreak = 1;
    }
  }

  if (!partial.isRest) {
    stats.totalWorkouts += 1;
    stats.totalMinutes += partial.duration;
    stats.totalXP += xpFor(partial.effort);
    stats.level = Math.floor(stats.totalXP / 100);
  }

  if (stats.currentStreak > stats.longestStreak)
    stats.longestStreak = stats.currentStreak;
  stats.lastWorkoutDate = date;
  storage.setStats(stats);

  // Milestone detection
  let newMilestone: number | undefined;
  const seen = storage.getMilestones();
  for (const m of MILESTONES) {
    if (stats.currentStreak >= m && !seen.includes(m)) {
      newMilestone = m;
      seen.push(m);
    }
  }
  storage.setMilestones(seen);

  return { newMilestone, stats };
}

export function todayStatus(): "none" | "workout" | "rest" {
  const today = todayStr();
  const ws = storage.getWorkouts().filter((w) => w.date === today);
  if (ws.length === 0) return "none";
  if (ws.every((w) => w.isRest)) return "rest";
  return "workout";
}
