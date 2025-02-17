import { Leaderboard } from '@/components/dashboard/leaderboard'
import { Sidebar } from '@/components/dashboard/sidebar'
import React from 'react'

const leaderboardDashboard = () => {
  return (
    <div className="block sm:flex h-screen bg-background">
      <div className="w-[100%] sm:w-64 block">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-blue-500">Leaderboard</h1>
            <p className="text-muted-foreground mt-2">
                Compete with others to earn tokens and climb the leaderboard
            </p>
          </div>
          <div className="grid gap-6">
          <Leaderboard/>
          </div>
        </div>
      </main>
    </div>
  )
}

export default leaderboardDashboard