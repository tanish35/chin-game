import { NextRequest, NextResponse } from 'next/server'
import prisma  from '@/lib/prisma'

interface LeaderboardEntry {
  id: string
  userId: string
  displayName: string
  totalTime: number
  penalties: number
  completedAt: Date
  score: number
}

export async function GET() {
  try {
    const leaderboards = await prisma.leaderboard.findMany({
      take: 50,
    })

    // Calculate score for each entry: time in seconds + penalties * 15
    const scoredLeaderboards: LeaderboardEntry[] = leaderboards.map((entry: any) => ({
      ...entry,
      score: Math.floor(entry.totalTime / 1000) + entry.penalties * 15
    }))

    // Sort by score ascending (lower score is better)
    scoredLeaderboards.sort((a: LeaderboardEntry, b: LeaderboardEntry) => a.score - b.score)

    return NextResponse.json(scoredLeaderboards)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, totalTime, penalties, displayName } = await request.json()

    if (!userId || typeof totalTime !== 'number' || typeof penalties !== 'number') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const entry = await prisma.leaderboard.upsert({
      where: { userId },
      update: {
        totalTime,
        penalties,
        displayName: displayName || `Player ${userId.slice(0, 8)}`,
        completedAt: new Date(),
      },
      create: {
        userId,
        totalTime,
        penalties,
        displayName: displayName || `Player ${userId.slice(0, 8)}`,
      },
    })

    return NextResponse.json(entry)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit score' }, { status: 500 })
  }
}