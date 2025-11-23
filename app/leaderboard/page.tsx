"use client";

import { useEffect, useState } from "react";

interface LeaderboardEntry {
  id: string;
  userId: string;
  displayName: string;
  totalTime: number;
  penalties: number;
  completedAt: Date;
}

export default function Leaderboard() {
  const [leaderboards, setLeaderboards] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard", { cache: "no-store" });
        const data = await res.json();
        setLeaderboards(data);
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      }
      setLoading(false);
    }

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-3xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-400 to-blue-500 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">🏆 Leaderboard</h1>
          <p className="text-xl text-white/80">
            Fastest solvers with fewest penalties
          </p>
          <a
            href="/game"
            className="inline-block mt-6 px-8 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition"
          >
            Play Game
          </a>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-linear-to-br from-purple-500 to-blue-500 text-white">
                <th className="p-6 text-left font-semibold text-lg">#</th>
                <th className="p-6 text-left font-semibold text-lg">Player</th>
                <th className="p-6 text-right font-semibold text-lg">Time</th>
                <th className="p-6 text-right font-semibold text-lg">Penalties</th>
                <th className="p-6 text-right font-semibold text-lg">Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboards.map((entry, index) => (
                <tr
                  key={entry.id}
                  className="border-b last:border-b-0 hover:bg-gray-50 transition"
                >
                  <td className="p-6 font-bold text-2xl">{index + 1}</td>
                  <td className="p-6 font-semibold">{entry.displayName}</td>
                  <td className="p-6 text-right">
                    {Math.floor(entry.totalTime / 1000)}s
                  </td>
                  <td className="p-6 text-right text-red-600 font-semibold">
                    {entry.penalties}
                  </td>
                  <td className="p-6 text-right font-bold text-2xl">
                    {Math.floor(entry.totalTime / 1000) +
                      entry.penalties * 30}
                  </td>
                </tr>
              ))}

              {leaderboards.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-12 text-center text-gray-500 text-xl"
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
