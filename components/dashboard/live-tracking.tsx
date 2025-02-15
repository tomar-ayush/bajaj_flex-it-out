"use client";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useExerciseCounter } from "@/lib/useExerciseCounter";
import { Camera, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

export function LiveTracking() {
  const { exerciseState, videoRef, canvasRef } = useExerciseCounter();
  const [tracking, setTracking] = useState(false);
  const [milestone, setMilestone] = useState<string | null>(null);

  useEffect(() => {
    if (exerciseState.squat > 0 && exerciseState.squat % 10 === 0) {
      toast({ title: `Milestone: ${exerciseState.squat} Squats!`, variant: "success" });
      setMilestone(`Milestone: ${exerciseState.squat} Squats!`);
      setTimeout(() => setMilestone(null), 3000);
    }
  }, [exerciseState.squat]);
  
  useEffect(() => {
    if (exerciseState.pushup > 0 && exerciseState.pushup % 10 === 0) {
      toast({ title: `Milestone: ${exerciseState.pushup} Push-ups!`, variant: "success" });
      setMilestone(`Milestone: ${exerciseState.pushup} Push-ups!`);
      setTimeout(() => setMilestone(null), 3000);
    }
  }, [exerciseState.pushup]);
  
  useEffect(() => {
    if (exerciseState.crunch > 0 && exerciseState.crunch % 10 === 0) {
      toast({ title: `Milestone: ${exerciseState.crunch} Crunches!`, variant: "success" });
      setMilestone(`Milestone: ${exerciseState.crunch} Crunches!`);
      setTimeout(() => setMilestone(null), 3000);
    }
  }, [exerciseState.crunch]);
  
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function initCamera() {
      if (tracking && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = stream;
        } catch (error) {
          console.error(error);
        }
      }
    }
    initCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [tracking, videoRef]);
  
  const toggleTracking = () => setTracking(prev => !prev);
  
  return (
    <Card className="overflow-hidden">
      <div className="border-b p-6">
        <h2 className="text-2xl font-semibold">Live Activity Tracking</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-powered exercise detection using TensorFlow.js MoveNet
        </p>
      </div>
      <div className="relative bg-black/90 transform scale-90 md:scale-75 mx-auto">
        <div className="absolute top-0 left-0 w-full bg-black bg-opacity-75 text-white p-2 flex justify-around z-10">
          <span>Squats: {exerciseState.squat}</span>
          <span>Push-ups: {exerciseState.pushup}</span>
          <span>Crunches: {exerciseState.crunch}</span>
        </div>
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-full object-cover"
          style={{ visibility: tracking ? "visible" : "hidden" }}
        />
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Button size="lg" className="gap-2" onClick={toggleTracking}>
            <Camera className="h-5 w-5" />
            {tracking ? "Stop Tracking" : "Start Tracking"}
          </Button>
        </div>
        {milestone && (
          <div className="absolute top-4 left-4 bg-green-500 text-white p-3 rounded-md shadow-md flex items-center gap-2 z-10">
            <Trophy className="h-5 w-5" />
            <span>{milestone}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

export default LiveTracking;
