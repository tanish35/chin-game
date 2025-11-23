"use client";

import { CHINS, type ChinPerson } from "@/src/lib/chins";
import { fuzzyMatch } from "@/src/lib/fuse";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/lib/theme";
import Image from "next/image";

interface GameState {
  currentIndex: number;
  shuffledChins: ChinPerson[];
  guesses: string[];
  penalties: number;
  startTime: number | null;
  userId: string;
  displayName: string;
  completed: boolean;
}

export default function Game() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [gameState, setGameState] = useState<GameState>({
    currentIndex: 0,
    shuffledChins: [],
    guesses: [],
    penalties: 0,
    startTime: null,
    userId: "",
    displayName: "",
    completed: false,
  });
  const [currentGuess, setCurrentGuess] = useState("");
  const [chancesLeft, setChancesLeft] = useState(3);
  const [showAnswer, setShowAnswer] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("chinGame");
    if (!saved) {
      router.push("/");
      return;
    }
    try {
      const parsed = JSON.parse(saved);
      if (!parsed.displayName || !parsed.displayName.trim()) {
        router.push("/");
        return;
      }
    } catch {
      router.push("/");
      return;
    }
  }, [router]);

  const shuffled = useMemo(() => {
    const shuffled = [...CHINS].sort(() => Math.random() - 0.5);
    return shuffled;
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("chinGame");
    let userId = crypto.randomUUID();
    let displayName = "";
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.userId) userId = parsed.userId;
        if (parsed.displayName) displayName = parsed.displayName;
      } catch {}
    }
    setGameState((prev) => ({
      ...prev,
      shuffledChins: shuffled,
      userId,
      displayName,
      startTime: Date.now(),
    }));
    localStorage.setItem("chinGame", JSON.stringify({ userId, displayName }));
  }, [shuffled]);

  useEffect(() => {
    if (gameState.startTime && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setTotalTime(Date.now() - gameState.startTime!);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.startTime]);

  const handleGuess = useCallback(async () => {
    if (!currentGuess.trim() || gameState.completed) return;

    const correctName = gameState.shuffledChins[gameState.currentIndex].name;
    const matched = fuzzyMatch(currentGuess.trim());

    if (matched === correctName) {
      // Correct!
      setGameState((prev) => {
        const newGuesses = [...prev.guesses, currentGuess.trim()];
        const nextIndex = prev.currentIndex + 1;
        if (nextIndex >= 10) {
          const time = Date.now() - prev.startTime!;
          // Submit score
          submitScore(prev.userId, time, prev.penalties, prev.displayName);
          return {
            ...prev,
            guesses: newGuesses,
            completed: true,
            startTime: null,
          };
        }
        return { ...prev, guesses: newGuesses, currentIndex: nextIndex };
      });
      setChancesLeft(3);
      setShowAnswer(false);
      setCurrentGuess("");
      inputRef.current?.focus();
    } else {
      // Wrong
      const newPenalties = gameState.penalties + 1;
      setGameState((prev) => ({ ...prev, penalties: newPenalties }));
      setChancesLeft((prev) => prev - 1);
      setCurrentGuess("");

      if (chancesLeft <= 1) {
        setShowAnswer(true);
        setTimeout(() => {
          setGameState((prev) => ({
            ...prev,
            currentIndex: prev.currentIndex + 1,
          }));
          setChancesLeft(3);
          setShowAnswer(false);
        }, 2000);
      }
      inputRef.current?.focus();
    }
  }, [currentGuess, gameState, chancesLeft]);

  const submitScore = async (
    userId: string,
    time: number,
    penalties: number,
    displayName?: string
  ) => {
    try {
      const trimmedName = displayName?.trim();
      await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          totalTime: time,
          penalties,
          ...(trimmedName ? { displayName: trimmedName } : {}),
        }),
      });
    } catch (e) {
      console.error("Failed to submit score", e);
    }
  };

  const resetGame = () => {
    localStorage.removeItem("chinGame");
    window.location.reload();
  };

  if (gameState.currentIndex >= 10 || gameState.completed) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Quiz Complete!</h1>
          <button
            onClick={toggleTheme}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
        <div className="space-y-4 mb-8">
          <p>Total Time: {Math.floor(totalTime / 1000)}s</p>
          <p>Penalties: {gameState.penalties}</p>
          <p className="font-bold">
            Final Score:{" "}
            {Math.floor(totalTime / 1000) + gameState.penalties * 15}
          </p>
          {gameState.displayName && <p>Player: {gameState.displayName}</p>}
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => (window.location.href = "/leaderboard")}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            View Leaderboard
          </button>
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  const currentChin = gameState.shuffledChins[gameState.currentIndex];

  if (!currentChin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-400 to-blue-500 dark:from-gray-800 dark:to-gray-900 p-4">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center">
          <p className="text-lg font-semibold">Loading your next chin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-400 to-blue-500 dark:from-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-center flex-1">
            {gameState.displayName && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Playing as {gameState.displayName}
              </div>
            )}
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Question {gameState.currentIndex + 1}/10
            </div>
            <div className="text-2xl font-bold mb-4">Who is this?</div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
        <div className="w-48 h-64 mx-auto bg-gray-200 dark:bg-gray-700 rounded-2xl overflow-hidden shadow-lg mb-4">
          <Image
            src={currentChin.image}
            alt="Chin"
            className="w-full h-full object-cover"
          />
        </div>
        {showAnswer && (
          <div className="text-lg font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 p-3 rounded-xl">
            It was {currentChin.name}!
          </div>
        )}
        <div className="space-y-3">
          <div className="flex justify-between text-lg">
            <span>Chances: {chancesLeft}</span>
            <span>Penalties: {gameState.penalties}</span>
          </div>
          <div className="flex justify-center text-sm text-gray-500 dark:text-gray-400">
            Time: {Math.floor(totalTime / 1000)}s
          </div>
        </div>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={currentGuess}
            onChange={(e) => setCurrentGuess(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGuess()}
            placeholder="Guess the name..."
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            disabled={showAnswer || gameState.completed}
          />
          <button
            onClick={handleGuess}
            disabled={!currentGuess.trim() || showAnswer || gameState.completed}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Guess
          </button>
        </div>
      </div>
    </div>
  );
}
