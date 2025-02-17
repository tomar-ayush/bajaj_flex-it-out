"use client"

import { Card } from '@/components/ui/card';
import { Coins, Star, Package, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from './sidebar';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { POST } from '@/app/api/auth/register/route';

const products = [
  {
    name: 'Premium Membership',
    description: '1 Month of exclusive premium features',
    tokens: 5000,
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&q=80&w=300&h=200',
    features: ['Personalized workout plans', 'Nutrition tracking', 'Priority support'],
    icon: Star,
  },
  {
    name: 'Resistance Bands Set',
    description: 'Professional grade resistance bands',
    tokens: 3000,
    image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&q=80&w=300&h=200',
    features: ['5 resistance levels', 'Carrying case', 'Exercise guide'],
    icon: Package,
  },
  {
    name: 'Smart Water Bottle',
    description: 'Track your hydration with smart sensors',
    tokens: 1,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=300&h=200',
    features: ['LED indicators', 'App connectivity', 'Temperature sensing'],
    icon: Zap,
  },
  {
    name: 'Workout Apparel Set',
    description: 'Premium fitness clothing bundle',
    tokens: 4000,
    image: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&q=80&w=300&h=200',
    features: ['Moisture-wicking fabric', 'Compression fit', 'Multiple sizes'],
    icon: Package,
  },
];


export default function RewardsDashboard() {

  const [tokens, setTokens] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  const fetchUserData = useCallback(async () => {
    try {
      setIsLoading(true);
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
      setTokens(data.data.user.tokens);
    } catch (err) {
      console.error("Error occurred while getting tokens:", err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserData();
    }
  }, [session, fetchUserData]);

  const handlePurchase = async (product: any) => {
    try {
      setIsLoading(true);

      // send email
      const sendEmail = await fetch('/api/user/sendEmail', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: `Purchase Successful!

Congrats your purchase of ${product.name} has been successful! Your ${product.tokens} has been deducted and it shall reflect in your dashboard soon.

You’ll receive it within 3 working days. Keep flexing and burning calories.

Team 100xdevs`,
          email: session?.user?.email,
        })
      })



      const response = await fetch("/api/user/purchase", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokens: product.tokens,
          email: session?.user?.email,
        })
      });

      if (!response.ok) {
        throw new Error('Purchase failed');
      }

      alert(`Purchase successful for: ${product.name}`);
      // send an email if needed

    } catch (err) {
      console.error("Error while purchasing:", err);
      alert('Purchase failed. Please try again.');
    } finally {
      // Refresh user data after purchase attempt, regardless of success/failure
      await fetchUserData();
      setIsLoading(false);
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-blue-500">Rewards Store</h1>
                <p className="text-muted-foreground mt-2">
                  Redeem your tokens for exclusive rewards
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
                <Coins className="h-5 w-5 text-primary" />
                <span className="font-semibold">{isLoading ? "Loading..." : tokens} tokens</span>
              </div>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {products.map((product) => (
              <Card key={product.name} className="overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute right-4 top-4 rounded-full bg-background/90 p-2">
                    <product.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{product.name}</h3>
                    <div className="flex items-center gap-1 text-primary">
                      <Coins className="h-4 w-4" />
                      <span>{product.tokens}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {product.description}
                  </p>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium">Features:</h4>
                    <ul className="mt-2 space-y-2">
                      {product.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    className="mt-4 w-full"
                    onClick={() => handlePurchase(product)}
                    disabled={product.tokens > tokens}
                  >
                    {product.tokens > tokens ? 'Not Enough Tokens' : 'Redeem Now'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
