"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme";

interface LeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  totalTime: number;
  penalties: number;
  completedAt: Date;
  score: number;
}

export default function Leaderboard() {
  const { theme, toggleTheme } = useTheme();
  const [leaderboards, setLeaderboards] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard", { cache: "no-store" });
        const data = await res.json();
        const sorted = [...data].sort((a, b) => a.score - b.score);
        setLeaderboards(sorted);
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      }
      setLoading(false);
    }

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white dark:text-gray-200 text-3xl bg-linear-to-br from-purple-400 to-blue-500 dark:from-gray-800 dark:to-gray-900">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-400 to-blue-500 dark:from-gray-800 dark:to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="text-center flex-1">
            <h1 className="text-5xl font-bold text-white dark:text-gray-200 mb-4">🏆 Leaderboard</h1>
            <p className="text-xl text-white/80 dark:text-gray-300">
              Lowest scores win! (Time + Penalties)
            </p>
            <a
              href="/game"
              className="inline-block mt-6 px-8 py-3 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-300 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Play Game
            </a>
          </div>
          <button
            onClick={toggleTheme}
            className="p-3 bg-white/20 dark:bg-gray-700 rounded-xl hover:bg-white/30 dark:hover:bg-gray-600 transition"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-linear-to-br from-purple-500 to-blue-500 dark:from-purple-700 dark:to-blue-700 text-white">
                <th className="p-6 text-left font-semibold text-lg">#</th>
                <th className="p-6 text-left font-semibold text-lg">Player</th>
                <th className="p-6 text-right font-semibold text-lg">Time</th>
                <th className="p-6 text-right font-semibold text-lg">Penalties</th>
              </tr>
            </thead>
            <tbody>
              {leaderboards.map((entry, index) => (
                <tr
                  key={entry.id}
                  className="border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="p-6 font-bold text-2xl">{index + 1}</td>
                  <td className="p-6 font-semibold">{entry.displayName}</td>
                  <td className="p-6 text-right">
                    {Math.floor(entry.totalTime / 1000)}s
                  </td>
                  <td className="p-6 text-right text-red-600 dark:text-red-400 font-semibold">
                    {entry.penalties}
                  </td>
                </tr>
              ))}

              {leaderboards.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-12 text-center text-gray-500 dark:text-gray-400 text-xl"
                  >
                    No scores yet. Be the first!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
