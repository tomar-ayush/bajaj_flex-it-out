'use client';

import { Card } from '@/components/ui/card';
import { Activity, Coins, Trophy } from 'lucide-react';

const stats = [
  {
    name: 'Calories Burned',
    value: '1,248',
    icon: Activity,
    change: '+12%',
    changeType: 'positive',
  },
  {
    name: 'Tokens Earned',
    value: '2,450',
    icon: Coins,
    change: '+8%',
    changeType: 'positive',
  },
  {
    name: 'Leaderboard Rank',
    value: '#12',
    icon: Trophy,
    change: '+3',
    changeType: 'positive',
  },
];

export function UserOverview() {
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
              className={`text-sm font-medium ${
                stat.changeType === 'positive'
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