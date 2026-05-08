import { useMemo, useState } from "react";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";
import {
  saveWorkout,
  updateWorkout,
  deleteWorkout,
  storage,
  type Effort,
  type Exercise,
  type Workout,
} from "@/lib/gym-storage";

interface Props {
  onSaved: (milestone?: number) => void;
}

const TYPES = ["Strength", "Cardio", "Mobility", "Sports"];

export function WorkoutLogTab({ onSaved }: Props) {
  const [mode, setMode] = useState<"quick" | "detailed">("quick");
  const [type, setType] = useState("Strength");
  const [custom, setCustom] = useState("");
  const [duration, setDuration] = useState(30);
  const [effort, setEffort] = useState<Effort>("Medium");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [editing, setEditing] = useState<Workout | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const finalType = () => (type === "Custom" ? custom.trim() || "Custom" : type);

  const handleSave = () => {
    const res = saveWorkout({
      type: finalType(),
      duration,
      effort,
      exercises: mode === "detailed" ? exercises : [],
    });
    onSaved(res.newMilestone);
  };

  const addExercise = () =>
    setExercises((prev) => [...prev, { name: "", sets: 3, reps: 10, weight: 0 }]);

  const updateExercise = (i: number, patch: Partial<Exercise>) => {
    setExercises((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
  };

  const removeExercise = (i: number) =>
    setExercises((prev) => prev.filter((_, idx) => idx !== i));

  const history = useMemo(() => {
    return [...storage.getWorkouts()].sort((a, b) =>
      b.date.localeCompare(a.date) || b.id.localeCompare(a.id),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyVersion]);

  const refreshHistory = () => setHistoryVersion((v) => v + 1);

  const handleDelete = (id: string) => {
    deleteWorkout(id);
    setConfirmDelete(null);
    refreshHistory();
  };

  return (
    <div className="px-5 pt-8 pb-6 space-y-5">
      <h1 className="text-2xl font-black">Workout Log</h1>

      {/* Segmented control */}
      <div className="bg-card p-1 rounded-2xl grid grid-cols-2 border border-border">
        {(["quick", "detailed"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`py-2.5 rounded-xl font-bold text-sm capitalize transition-colors ${
              mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            {m} Log
          </button>
        ))}
      </div>

      {/* Type */}
      <div className="bg-card rounded-2xl p-5 border border-border space-y-3">
        <p className="text-xs uppercase text-muted-foreground font-bold tracking-wide">
          Workout Type
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[...TYPES, "Custom"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`py-3 rounded-xl text-sm font-bold border ${
                type === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {type === "Custom" && (
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Workout name..."
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm"
          />
        )}
      </div>

      {/* Duration */}
      <div className="bg-card rounded-2xl p-5 border border-border">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase text-muted-foreground font-bold tracking-wide">
            Duration
          </p>
          <p className="text-2xl font-black text-primary">
            {duration}
            <span className="text-sm font-bold text-muted-foreground"> min</span>
          </p>
        </div>
        <input
          type="range"
          min={5}
          max={120}
          step={5}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full mt-3 accent-primary"
        />
      </div>

      {/* Effort */}
      <div className="bg-card rounded-2xl p-5 border border-border">
        <p className="text-xs uppercase text-muted-foreground font-bold tracking-wide mb-3">
          Effort
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(["Easy", "Medium", "Hard"] as Effort[]).map((e) => (
            <button
              key={e}
              onClick={() => setEffort(e)}
              className={`py-3 rounded-xl font-bold text-sm border ${
                effort === e
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Detailed exercises */}
      {mode === "detailed" && (
        <div className="bg-card rounded-2xl p-5 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase text-muted-foreground font-bold tracking-wide">
              Exercises
            </p>
            <button
              onClick={addExercise}
              className="flex items-center gap-1 text-primary text-sm font-bold"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
          {exercises.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No exercises yet. Tap Add.
            </p>
          )}
          {exercises.map((ex, i) => (
            <div key={i} className="bg-background rounded-xl p-3 space-y-2 border border-border">
              <div className="flex gap-2">
                <input
                  value={ex.name}
                  onChange={(e) => updateExercise(i, { name: e.target.value })}
                  placeholder="Exercise"
                  className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm"
                />
                <button onClick={() => removeExercise(i)} className="text-destructive p-2">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <NumField label="Sets" value={ex.sets} onChange={(v) => updateExercise(i, { sets: v })} />
                <NumField label="Reps" value={ex.reps} onChange={(v) => updateExercise(i, { reps: v })} />
                <NumField label="Weight" value={ex.weight} onChange={(v) => updateExercise(i, { weight: v })} />
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSave}
        className="w-full bg-primary text-primary-foreground font-black py-4 rounded-2xl active:scale-[0.98] transition-transform shadow-glow"
      >
        Save Workout
      </button>

      {/* History */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-black">History</h2>
        {history.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No past workouts yet.
          </p>
        )}
        {history.map((w) => (
          <div
            key={w.id}
            className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="font-bold truncate">
                {w.isRest ? "Rest Day" : w.type}
              </p>
              <p className="text-xs text-muted-foreground">
                {w.date}
                {!w.isRest && ` · ${w.duration} min · ${w.effort}`}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              {!w.isRest && (
                <button
                  onClick={() => setEditing(w)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-primary"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setConfirmDelete(w.id)}
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <EditWorkoutModal
          workout={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refreshHistory();
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          message="Delete this workout? Your stats will be recalculated."
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => handleDelete(confirmDelete)}
        />
      )}
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase text-muted-foreground font-semibold">{label}</p>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full bg-card border border-border rounded-lg px-2 py-1.5 text-sm font-bold"
      />
    </div>
  );
}

function EditWorkoutModal({
  workout,
  onClose,
  onSaved,
}: {
  workout: Workout;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [type, setType] = useState(workout.type);
  const [date, setDate] = useState(workout.date);
  const [duration, setDuration] = useState(workout.duration);
  const [effort, setEffort] = useState<Effort>(workout.effort);

  const save = () => {
    updateWorkout(workout.id, { type, date, duration, effort });
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4">
      <div className="bg-card rounded-3xl border border-border w-full max-w-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black">Edit Workout</h3>
          <button onClick={onClose} className="p-1 text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase text-muted-foreground font-bold tracking-wide">
            Type
          </label>
          <input
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase text-muted-foreground font-bold tracking-wide">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase text-muted-foreground font-bold tracking-wide">
              Duration
            </span>
            <span className="text-xl font-black text-primary">
              {duration}
              <span className="text-xs font-bold text-muted-foreground"> min</span>
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full mt-2 accent-primary"
          />
        </div>

        <div>
          <p className="text-xs uppercase text-muted-foreground font-bold tracking-wide mb-2">
            Effort
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(["Easy", "Medium", "Hard"] as Effort[]).map((e) => (
              <button
                key={e}
                onClick={() => setEffort(e)}
                className={`py-2.5 rounded-xl font-bold text-sm border ${
                  effort === e
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={save}
          className="w-full bg-primary text-primary-foreground font-black py-3 rounded-2xl flex items-center justify-center gap-2"
        >
          <Check className="h-5 w-5" /> Save Changes
        </button>
      </div>
    </div>
  );
}

function ConfirmModal({
  message,
  onCancel,
  onConfirm,
}: {
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl border border-border w-full max-w-sm p-5 space-y-4">
        <p className="font-bold">{message}</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="py-3 rounded-xl bg-background border border-border font-bold"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="py-3 rounded-xl bg-destructive text-destructive-foreground font-bold"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
