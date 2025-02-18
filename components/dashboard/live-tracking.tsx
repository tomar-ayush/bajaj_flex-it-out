"use client";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ExerciseType, useExerciseCounter } from "@/hooks/useExerciseCounter";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";

export function LiveTracking() {
  const {
    exerciseCounts,
    totalReps,
    videoRef,
    canvasRef,
    enableDetection,
    toggleCamera,
    currExercise,
    setCurrExercise,

  } = useExerciseCounter();

  const startAudioRef = useRef<HTMLAudioElement | null>(null);
  const milestoneAudioRef = useRef<HTMLAudioElement | null>(null);


  useEffect(() => { 
    toast({ title: `Click on start flexing button to get started!`, variant: "success" });
  }, []);

  useEffect(() => {
    if (currExercise && startAudioRef.current) {
      startAudioRef.current
        .play()
        .catch((err) => console.error("Start Audio Error:", err));
    }
    
  }, [currExercise]);

  // Play beep sound on milestone reps
  useEffect(() => {
    const checkMilestone = (name: ExerciseType, count: number) => {
      if (count > 0 && count % 5 === 0) {
        // Change to 10 if needed
        if (milestoneAudioRef.current) {
          milestoneAudioRef.current
            .play()
            .catch((err) => console.error("Beep Audio Error:", err));
        }
        toast({ title: `Milestone: ${count} ${name}s!`, variant: "success" });
      }
    };

    checkMilestone("Squat", exerciseCounts.squat);
    checkMilestone("Push-Up", exerciseCounts.pushup);
    checkMilestone("Pull-Up", exerciseCounts.pullup);
  }, [exerciseCounts]);

  const exerciseOptions: ExerciseType[] = ["Push-Up", "Pull-Up", "Squat"];

  return (
    <Card className="overflow-hidden">
      <audio ref={startAudioRef} src="/start.mp3" preload="auto" />
      <audio ref={milestoneAudioRef} src="/start.mp3" preload="auto" />

      <div className="border-b p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold">
            Live Activity Tracking
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-powered exercise detection using TensorFlow.js MoveNet
          </p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center md:justify-end">
          {exerciseOptions.map((option) => (
            <Button
              key={option}
              variant={currExercise === option ? "default" : "outline"}
              onClick={() => setCurrExercise(option)}
              size="sm"
            >
              {option}
            </Button>
          ))}
          <Button
           style={{
            color: '#3b82f6', 
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)',
          }}
            variant={enableDetection ? "default" : "outline"}
            onClick={toggleCamera}
            size="sm"
          >
            {enableDetection ? "Stop Flexing" : "Start Flexing"}
          </Button>
        </div>
      </div>

      {/* Exercise Count Section */}
      <div className="border-t border-b p-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-white bg-black bg-opacity-75 text-center">
        {currExercise ? (
          <span className="col-span-2 md:col-span-4 text-lg font-medium">
            {currExercise}s:{" "}
            {currExercise === "Push-Up"
              ? exerciseCounts.pushup
              : currExercise === "Pull-Up"
                ? exerciseCounts.pullup
                : exerciseCounts.squat}
          </span>
        ) : (
          <>
            <span>Push-Ups: {exerciseCounts.pushup}</span>
            <span>Pull-Ups: {exerciseCounts.pullup}</span>
            <span>Squats: {exerciseCounts.squat}</span>
            <span>Total: {totalReps}</span>
          </>
        )}
      </div>

      {/* Video & Canvas Section */}
      <div className="relative bg-black mx-auto w-full max-w-2xl aspect-video">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-full object-cover"
          style={{ visibility: enableDetection ? "visible" : "hidden" }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
        />
      </div>
    </Card>
  );
}

export default LiveTracking;
