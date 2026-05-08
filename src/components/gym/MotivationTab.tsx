import { Flame } from "lucide-react";
import { MOTIVATION_QUOTES } from "@/lib/motivation";

export function MotivationTab() {
  return (
    <div className="px-5 pt-8 pb-6 space-y-4">
      <div>
        <h1 className="text-2xl font-black">Motivation</h1>
        <p className="text-sm text-muted-foreground">Fuel for the grind.</p>
      </div>

      <div className="space-y-3">
        {MOTIVATION_QUOTES.map((q, i) => {
          const featured = i % 5 === 0;
          if (featured) {
            return (
              <div
                key={i}
                className="rounded-2xl gradient-primary p-6 text-primary-foreground shadow-glow"
              >
                <Flame className="h-6 w-6 mb-2" />
                <p className="text-2xl font-black leading-tight">{q}</p>
              </div>
            );
          }
          return (
            <div
              key={i}
              className="rounded-2xl bg-card border border-border p-5"
            >
              <p className="text-lg font-bold leading-snug">{q}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
