import { useState } from "react";
import { X } from "lucide-react";
import { saveWorkout, type Effort } from "@/lib/gym-storage";

interface Props {
  onClose: () => void;
  onSaved: (milestone?: number) => void;
}

const TYPES = ["Strength", "Cardio", "Mobility", "Sports"];

export function QuickLogModal({ onClose, onSaved }: Props) {
  const [type, setType] = useState("Strength");
  const [custom, setCustom] = useState("");
  const [duration, setDuration] = useState(30);
  const [effort, setEffort] = useState<Effort>("Medium");

  const handleSave = () => {
    const finalType = type === "Custom" ? custom.trim() || "Custom" : type;
    const res = saveWorkout({
      type: finalType,
      duration,
      effort,
      exercises: [],
    });
    onSaved(res.newMilestone);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-card w-full max-w-md rounded-t-3xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">Quick Log</h2>
          <button onClick={onClose} className="text-muted-foreground p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div>
          <p className="text-xs uppercase text-muted-foreground font-semibold mb-2">Type</p>
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
              placeholder="Workout type..."
              className="mt-2 w-full bg-background border border-border rounded-xl px-3 py-2 text-sm"
            />
          )}
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <p className="text-xs uppercase text-muted-foreground font-semibold">Duration</p>
            <p className="text-sm font-bold text-primary">{duration} min</p>
          </div>
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div>
          <p className="text-xs uppercase text-muted-foreground font-semibold mb-2">Effort</p>
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

        <button
          onClick={handleSave}
          className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl active:scale-[0.98] transition-transform"
        >
          Save Workout
        </button>
      </div>
    </div>
  );
}
