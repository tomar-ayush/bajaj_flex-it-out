"use client"
import { Card } from '@/components/ui/card';
import { Trophy, Gift, Timer, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from './sidebar';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const challenges = [
  {
    id: '110',
    title: '5 Rep Challenge',
    description: 'Complete 5 reps of each exercise',
    exercises: ['Push-ups', 'Squats', 'Burpees'],
    reward: 100,
    difficulty: 'Beginner',
    timeLimit: '5 minutes',
    icon: Dumbbell,
  },
  {
    id: '111',
    title: '10 Rep Challenge',
    description: 'Complete 10 reps of each exercise',
    exercises: ['Push-ups', 'Squats', 'Lunges', 'Sit-ups'],
    reward: 250,
    difficulty: 'Intermediate',
    timeLimit: '10 minutes',
    icon: Timer,
  },
  {
    id: '112',
    title: '20 Rep Challenge',
    description: 'Complete 20 reps of each exercise',
    exercises: ['Push-ups', 'Squats', 'Burpees', 'Mountain Climbers'],
    reward: 500,
    difficulty: 'Advanced',
    timeLimit: '15 minutes',
    icon: Trophy,
  },
  {
    id: '113',
    title: '30 Rep Challenge',
    description: 'Complete 30 reps of each exercise',
    exercises: ['Push-ups', 'Squats', 'Burpees', 'Planks', 'Jump Rope'],
    reward: 1000,
    difficulty: 'Expert',
    timeLimit: '20 minutes',
    icon: Gift,
  },
];

export default function ChallengesDashboard() {

  const { data: session } = useSession();

  const startChallange = async (challengeId: string) => {
    try {
      console.log(session);
      const response = await fetch('/api/start-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session?.user.email, challengeId }),
      });
      const result = await response.json();

      //logic to be added soon

      if (response.ok) {
        alert('Challenge started successfully!');
      } else {
        alert(result.message || 'Error starting challenge');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error starting challenge');
    }
  };

  return (
    <div className="block sm:flex h-screen bg-background">
      <div className="w-[100%] sm:w-64 block">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-blue-500">Fitness Challenges</h1>
            <p className="text-muted-foreground mt-2">
              Complete challenges to earn tokens and climb the leaderboard
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {challenges.map((challenge) => (
              <Card key={challenge.title} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <challenge.icon className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold">{challenge.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {challenge.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <Trophy className="h-4 w-4" />
                    <span>{challenge.reward}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {challenge.exercises.map((exercise) => (
                      <span
                        key={exercise}
                        className="rounded-full bg-secondary px-3 py-1 text-xs"
                      >
                        {exercise}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Time Limit: {challenge.timeLimit}
                  </span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                    {challenge.difficulty}
                  </span>
                </div>
                <Link href="/dashboard">
                  <Button className="mt-4 w-full" onClick={() => startChallange(challenge.id)} >
                    Start Challenge</Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
