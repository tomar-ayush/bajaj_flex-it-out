'use client';

import { Card } from '@/components/ui/card';
import { Coins } from 'lucide-react';
import { Button } from '../ui/button';

const rewards = [
  {
    name: 'Premium Membership',
    tokens: 5000,
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&q=80&w=300&h=200',
  },
  {
    name: 'Fitness Equipment',
    tokens: 3000,
    image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&q=80&w=300&h=200',
  },
];

export function RewardsSection() {
  return (
    <Card>
      <div className="border-b p-6">
        <h2 className="text-2xl font-semibold">Rewards Store</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Redeem your earned tokens
        </p>
      </div>
      <div className="grid gap-6 p-6">
        {rewards.map((reward) => (
          <div
            key={reward.name}
            className="flex gap-4 rounded-lg border p-4"
          >
            <img
              src={reward.image}
              alt={reward.name}
              className="h-24 w-24 rounded-md object-cover"
            />
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h3 className="font-semibold">{reward.name}</h3>
                <div className="mt-1 flex items-center gap-1 text-primary">
                  <Coins className="h-4 w-4" />
                  <span>{reward.tokens}</span>
                </div>
              </div>
              <Button>Redeem Now</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}