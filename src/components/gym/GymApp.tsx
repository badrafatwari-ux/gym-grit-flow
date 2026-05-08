import { useEffect, useState } from "react";
import { Home, Dumbbell, TrendingUp, Flame, Settings as SettingsIcon } from "lucide-react";
import { TodayTab } from "@/components/gym/TodayTab";
import { WorkoutLogTab } from "@/components/gym/WorkoutLogTab";
import { ProgressTab } from "@/components/gym/ProgressTab";
import { MotivationTab } from "@/components/gym/MotivationTab";
import { SettingsTab } from "@/components/gym/SettingsTab";
import { MilestoneModal } from "@/components/gym/MilestoneModal";
import { storage, defaultSettings } from "@/lib/gym-storage";

export type TabId = "today" | "log" | "progress" | "motivation" | "settings";

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "today", label: "Today", icon: Home },
  { id: "log", label: "Log", icon: Dumbbell },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "motivation", label: "Motivate", icon: Flame },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export function GymApp() {
  const [tab, setTab] = useState<TabId>("today");
  const [milestone, setMilestone] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Initialize defaults
    const existing = localStorage.getItem("ghb_settings");
    if (!existing) storage.setSettings(defaultSettings);
  }, []);

  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col max-w-md mx-auto">
      <main className="flex-1 pb-24 overflow-y-auto" key={refreshKey}>
        {tab === "today" && (
          <TodayTab
            goToLog={() => setTab("log")}
            onChange={refresh}
            onMilestone={setMilestone}
          />
        )}
        {tab === "log" && (
          <WorkoutLogTab
            onSaved={(m) => {
              if (m) setMilestone(m);
              setTab("today");
              refresh();
            }}
          />
        )}
        {tab === "progress" && <ProgressTab />}
        {tab === "motivation" && <MotivationTab />}
        {tab === "settings" && <SettingsTab onReset={refresh} />}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-40">
        <div className="max-w-md mx-auto bg-card/95 backdrop-blur border-t border-border">
          <div className="grid grid-cols-5">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex flex-col items-center gap-1 py-3 transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "scale-110" : ""} transition-transform`} />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {milestone !== null && (
        <MilestoneModal days={milestone} onClose={() => setMilestone(null)} />
      )}
    </div>
  );
}
