'use client';

import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Medal } from 'lucide-react';
import { useState, useEffect } from "react"
import { useSession } from 'next-auth/react';

interface User {
  name: string;
  points: number;
  image?: string;
}

const DEFAULT_AVATAR = "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?t=st=1739812418~exp=1739816018~hmac=2442be3cd30435c77e5ab68924abe83003c70c93db0a9ef781b4625d57154d82&w=740"



export function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { status, data: session } = useSession();

  const getAllUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/getTopUsers`);
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  return (
    <Card>
      <div className="flex justify-between border-b p-6">
        <div>
          <h2 className="text-2xl font-semibold">Leaderboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Top performers this week
          </p>

        </div>
        <div>

          <button
            onClick={getAllUsers}
            disabled={isLoading}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="text-center">Loading users...</div>
        ) : (
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
                      src={user.image || session?.user?.image || DEFAULT_AVATAR}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = DEFAULT_AVATAR;
                      }}
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
        )}
      </div>
    </Card>
  );
}
