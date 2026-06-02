import { useEffect, useState } from "react";

interface WaveformVisualizerProps {
  isPlaying: boolean;
}

export default function WaveformVisualizer({ isPlaying }: WaveformVisualizerProps) {
  const [heights, setHeights] = useState<number[]>(Array(24).fill(12));

  useEffect(() => {
    let intervalId: any;
    if (isPlaying) {
      intervalId = setInterval(() => {
        setHeights(
          Array(24)
            .fill(0)
            .map(() => Math.floor(Math.random() * 32) + 6)
        );
      }, 100);
    } else {
      setHeights(Array(24).fill(8));
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying]);

  return (
    <div className="flex items-end gap-1.5 h-16 justify-center px-4 bg-gray-50 dark:bg-zinc-900/40 rounded-xl border border-gray-100 dark:border-zinc-800/60 max-w-sm mx-auto overflow-hidden">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-1 rounded-t-full transition-all duration-100 ${
            isPlaying
              ? "bg-gradient-to-t from-teal-500 to-indigo-600"
              : "bg-gray-300 dark:bg-zinc-700"
          }`}
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}
