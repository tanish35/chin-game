import { NextRequest, NextResponse } from 'next/server'
import prisma  from '@/lib/prisma'

export async function GET() {
  try {
    const leaderboards = await prisma.leaderboard.findMany({
      orderBy: [
        { totalTime: 'asc' },
        { penalties: 'asc' },
      ],
      take: 50,
    })
    return NextResponse.json(leaderboards)
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