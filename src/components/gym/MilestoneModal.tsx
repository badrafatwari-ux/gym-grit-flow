import { Flame } from "lucide-react";

interface Props {
  days: number;
  onClose: () => void;
}

export function MilestoneModal({ days, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto w-20 h-20 rounded-full gradient-primary flex items-center justify-center shadow-glow">
          <Flame className="h-10 w-10 text-primary-foreground" />
        </div>
        <h2 className="text-3xl font-black">{days} Day Streak!</h2>
        <p className="text-muted-foreground">Keep going. You're unstoppable.</p>
        <button
          onClick={onClose}
          className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl"
        >
          Let's Keep Going
        </button>
      </div>
    </div>
  );
}
