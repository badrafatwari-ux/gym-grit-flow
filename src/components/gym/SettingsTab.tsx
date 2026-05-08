import { useState } from "react";
import { storage, defaultSettings, type Settings } from "@/lib/gym-storage";

interface Props {
  onReset: () => void;
}

export function SettingsTab({ onReset }: Props) {
  const [settings, setSettings] = useState<Settings>(() => storage.getSettings());
  const [confirmReset, setConfirmReset] = useState(false);

  const update = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    storage.setSettings(next);
  };

  const doReset = () => {
    storage.resetAll();
    storage.setSettings(defaultSettings);
    setSettings(defaultSettings);
    setConfirmReset(false);
    onReset();
  };

  return (
    <div className="px-5 pt-8 pb-6 space-y-5">
      <h1 className="text-2xl font-black">Settings</h1>

      <div className="bg-card rounded-2xl p-5 border border-border">
        <div className="flex justify-between mb-2">
          <p className="text-xs uppercase text-muted-foreground font-bold tracking-wide">
            Weekly Target
          </p>
          <p className="text-sm font-bold text-primary">{settings.weeklyTarget} days</p>
        </div>
        <input
          type="range"
          min={1}
          max={6}
          value={settings.weeklyTarget}
          onChange={(e) => update({ weeklyTarget: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </div>

      <div className="bg-card rounded-2xl p-5 border border-border">
        <div className="flex justify-between mb-2">
          <p className="text-xs uppercase text-muted-foreground font-bold tracking-wide">
            Min Workout Minutes
          </p>
          <p className="text-sm font-bold text-primary">{settings.minWorkoutMinutes} min</p>
        </div>
        <input
          type="range"
          min={5}
          max={60}
          step={5}
          value={settings.minWorkoutMinutes}
          onChange={(e) => update({ minWorkoutMinutes: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </div>

      <div className="bg-card rounded-2xl p-5 border border-border flex items-center justify-between">
        <div>
          <p className="font-bold">Rest day counts</p>
          <p className="text-xs text-muted-foreground">Keep streaks alive on rest days</p>
        </div>
        <button
          onClick={() => update({ restDayCounts: !settings.restDayCounts })}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            settings.restDayCounts ? "bg-primary" : "bg-muted"
          }`}
        >
          <div
            className={`absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform ${
              settings.restDayCounts ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <button
        onClick={() => setConfirmReset(true)}
        className="w-full bg-destructive/10 text-destructive font-bold py-4 rounded-2xl border border-destructive/30"
      >
        Reset All Data
      </button>

      <p className="text-center text-xs text-muted-foreground pt-4">
        Build the habit. Become unstoppable.
      </p>

      {confirmReset && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6"
          onClick={() => setConfirmReset(false)}
        >
          <div
            className="bg-card rounded-3xl p-6 max-w-sm w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-black">Reset everything?</h3>
            <p className="text-sm text-muted-foreground">
              All workouts, streaks and stats will be erased. This can't be undone.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirmReset(false)}
                className="py-3 rounded-xl border border-border font-bold"
              >
                Cancel
              </button>
              <button
                onClick={doReset}
                className="py-3 rounded-xl bg-destructive text-destructive-foreground font-bold"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
