import PoseCreation from "@/components/dashboard/pose-creation";
import { Sidebar } from '@/components/dashboard/sidebar'
import React from 'react'

const Challenges = () => {
  return (
    <div className="block sm:flex h-screen bg-background">
      <div className="w-[100%] sm:w-64 block">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-blue-500">Add New Pose</h1>
            <p className="text-muted-foreground mt-2">
              Add your custom new pose
            </p>
          </div>
          <div className="grid gap-6">
            <PoseCreation />
          </div>
        </div>
      </main>
    </div>

  )
}

export default Challenges
