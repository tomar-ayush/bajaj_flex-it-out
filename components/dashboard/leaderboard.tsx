'use client';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Medal } from 'lucide-react';

const users = [
  {
    name: 'Sarah Johnson',
    points: 12500,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=50&h=50',
  },
  {
    name: 'Michael Chen',
    points: 11200,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=50&h=50',
  },
  {
    name: 'Emma Wilson',
    points: 10800,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=50&h=50',
  },
];

export function Leaderboard() {
  return (
    <Card>
      <div className="border-b p-6">
        <h2 className="text-2xl font-semibold">Leaderboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Top performers this week
        </p>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {users.map((user, index) => (
            <div
              key={user.name}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-semibold">
                  {index + 1}
                </div>
                <Avatar>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.points.toLocaleString()} points
                  </p>
                </div>
              </div>
              {index === 0 && (
                <Medal className="h-6 w-6 text-yellow-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}