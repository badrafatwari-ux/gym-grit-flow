import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GymApp } from "@/components/gym/GymApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gym Habit Builder — Build the habit. Become unstoppable." },
      {
        name: "description",
        content:
          "Consistency-first gym habit tracker. Log workouts, build streaks, level up.",
      },
      { property: "og:title", content: "Gym Habit Builder" },
      {
        property: "og:description",
        content: "Build the habit. Become unstoppable.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }
  return <GymApp />;
}
