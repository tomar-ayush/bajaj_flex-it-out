'use client';

import { Card } from '@/components/ui/card';
import { Activity, Coins, Trophy } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function UserOverview() {
  const [rank, setRank] = useState("");
  const [calories, setCalories] = useState("")
  const [tokens, setTokens] = useState("")
  const [error, setError] = useState("");
  const { status, data: session } = useSession();

  // Move stats inside the component to access rank state
  const stats = [
    {
      name: 'Calories Burned',
      value:  calories == "loading..." ? "loading..." : calories ? `${calories} cal` : '0 cal',
      icon: Activity,
      change: '+12%',
      changeType: 'positive',
    },
    {
      name: 'Tokens Earned',
      value: tokens == "loading..." ? "loading..." : tokens ? `${tokens}` : '0',
      icon: Coins,
      change: '+8%',
      changeType: 'positive',
    },
    {
      name: 'Leaderboard Rank',
      value: rank == "loading..." ? "loading..." : rank ? `#${rank}` : 'N/A',
      icon: Trophy,
      change: '+3',
      changeType: 'positive',
    },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = session?.user?.email;
        if (!email) {
          throw new Error('No user email found');
        }

        const response = await fetch(
          `/api/getCurrUser?email=${encodeURIComponent(email)}`
        );

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setCalories(data.data.user.calories);
        setTokens(data.data.user.tokens)
        setRank(data.data.rank);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setRank("loading...");
      }
    };

    if (session?.user?.email) {
      fetchUserData();
    }
  }, [session]); // Add session as dependency

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.name} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </p>
              <h3 className="mt-2 text-3xl font-semibold">{stat.value}</h3>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <stat.icon className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4">
            <span
              className={`text-sm font-medium ${stat.changeType === 'positive'
                ? 'text-green-600'
                : 'text-red-600'
                }`}
            >
              {stat.change}
            </span>
            <span className="text-sm text-muted-foreground"> vs last week</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
