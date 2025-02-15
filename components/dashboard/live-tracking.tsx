"use client";

import { Card } from "@/components/ui/card";
import { useExerciseCounter } from "@/lib/useExerciseCounter";
import { Camera, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

export function LiveTracking() {
  const { exerciseState, videoRef, canvasRef } = useExerciseCounter();
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    async function initCamera() {
      if (tracking && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = stream;
        } catch (error) {
          console.error("Error accessing camera:", error);
        }
      }
    }
    initCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [tracking]);

  const toggleTracking = () => {
    setTracking((prev) => !prev);
  };

  return (
    <Card className="overflow-hidden">
      <div className="border-b p-6">
        <h2 className="text-2xl font-semibold">Live Activity Tracking</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-powered movement detection using TensorFlow.js MoveNet
        </p>
      </div>

      <div className="aspect-video relative bg-black/90">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-full object-cover"
          style={{ visibility: tracking ? "visible" : "hidden" }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Button size="lg" className="gap-2" onClick={toggleTracking}>
            <Camera className="h-5 w-5" />
            {tracking ? "Stop Tracking" : "Start Tracking"}
          </Button>
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-semibold">Detected Exercises</h3>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Squats</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {exerciseState.squat.count} reps
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Push-ups</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {exerciseState.pushup.count} reps
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Crunches</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {exerciseState.crunch.count} reps
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
