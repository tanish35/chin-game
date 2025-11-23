'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [playerName, setPlayerName] = useState('')
  const [error, setError] = useState('')
  const [isStarting, setIsStarting] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('chinGame')
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      if (parsed.displayName) {
        setPlayerName(parsed.displayName)
      }
    } catch (err) {
      console.warn('Failed to parse saved chin data', err)
    }
  }, [])

  useEffect(() => {
    if (playerName.trim()) {
      const saved = localStorage.getItem('chinGame')
      let userId = ''
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.userId) userId = parsed.userId
        } catch {}
      }
      if (!userId) userId = crypto.randomUUID()
      localStorage.setItem('chinGame', JSON.stringify({ userId, displayName: playerName.trim() }))
    }
  }, [playerName])

  const handleStart = () => {
    const trimmed = playerName.trim()
    if (!trimmed) {
      setError('Please enter a name to continue')
      return
    }

    setError('')
    setIsStarting(true)
    try {
      const saved = localStorage.getItem('chinGame')
      let userId = crypto.randomUUID()
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.userId) userId = parsed.userId
        } catch {}
      }
      localStorage.setItem('chinGame', JSON.stringify({ userId, displayName: trimmed }))
      router.push('/game')
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 space-y-8 text-center">
        <div>
          <p className="uppercase tracking-[0.3em] text-sm font-semibold text-purple-500 mb-3">Guess The Chin</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">How many celebrities can you spot by their chin?</h1>
          <p className="text-lg text-gray-600">
            Enter your name, hit start, and race against the clock. You get three chances per chin—go fast, avoid penalties, and climb the leaderboard.
          </p>
        </div>

        <div className="space-y-4">
          <input
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleStart()}
            placeholder="e.g. Chin Champion"
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 text-lg outline-none"
            aria-label="Player name"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleStart}
            disabled={!playerName.trim() || isStarting}
            className="w-full py-4 rounded-2xl bg-purple-600 text-white text-lg font-semibold shadow-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isStarting ? 'Loading...' : 'Start the Game'}
          </button>
          <div className="flex justify-center gap-6 text-sm text-gray-500">
            <span>⏱️ 10 rounds</span>
            <span>⚡ 3 guesses per chin</span>
            <span>🏆 Fastest players win</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <Link
            href="/leaderboard"
            className="px-6 py-3 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            View Leaderboard
          </Link>
        </div>
      </div>
    </div>
  )
}
