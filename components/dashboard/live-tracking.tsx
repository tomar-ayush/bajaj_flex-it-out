'use client';

import { Card } from '@/components/ui/card';
import { Camera, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';

export function LiveTracking() {
  return (
    <Card className="overflow-hidden">
      <div className="border-b p-6">
        <h2 className="text-2xl font-semibold">Live Activity Tracking</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-powered movement detection
        </p>
      </div>
      <div className="aspect-video bg-black/90 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Button size="lg" className="gap-2">
            <Camera className="h-5 w-5" />
            Start Tracking
          </Button>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-semibold">Detected Exercises</h3>
        <div className="mt-4 space-y-3">
          {['Squats', 'Push-ups', 'Crunches'].map((exercise) => (
            <div
              key={exercise}
              className="flex items-center justify-between rounded-lg bg-muted p-3"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>{exercise}</span>
              </div>
              <span className="text-sm text-muted-foreground">98% accuracy</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}