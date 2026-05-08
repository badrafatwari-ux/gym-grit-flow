import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveWorkout, type Effort, type Exercise } from "@/lib/gym-storage";

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
          <p className="text-2xl font-black text-primary">{duration}<span className="text-sm font-bold text-muted-foreground"> min</span></p>
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
