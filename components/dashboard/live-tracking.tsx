"use client";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ExerciseType, useExerciseCounter } from "@/lib/useExerciseCounter";
import { useEffect } from "react";
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

  // Show milestone toast for multiples of 10
  useEffect(() => {
    const checkMilestone = (name: ExerciseType, count: number) => {
      if (count > 0 && count % 10 === 0) {
        toast({ title: `Milestone: ${count} ${name}s!`, variant: "success" });
      }
    };
    checkMilestone("Squat", exerciseCounts.squat);
    checkMilestone("Push-Up", exerciseCounts.pushup);
    checkMilestone("Pull-Up", exerciseCounts.pullup);
  }, [exerciseCounts]);

  // We have 3 exercise options plus "No Count" toggles camera
  const exerciseOptions: ExerciseType[] = ["Push-Up", "Pull-Up", "Squat"];

  return (
    <Card className="overflow-hidden">
      <div className="border-b p-6">
        <h2 className="text-2xl font-semibold">Live Activity Tracking</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-powered exercise detection using TensorFlow.js MoveNet
        </p>
      </div>

      {/* Top row of 4 buttons */}
      <div className="flex gap-2 p-4 justify-center">
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
          variant={!enableDetection ? "default" : "outline"}
          onClick={toggleCamera}
          size="sm"
        >
          {enableDetection ? "Stop Camera" : "No Count"}
        </Button>
      </div>

      {/* Middle black bar: if an exercise is selected => show that count, else show total */}
      <div className="border-t border-b p-4 flex justify-around text-white bg-black bg-opacity-75">
        {currExercise ? (
          <span>
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

      {/* Video + Canvas + center overlay toggle */}
      <div
        className="relative bg-black mx-auto"
        style={{ width: "640px", height: "480px" }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-full object-cover"
          style={{ visibility: enableDetection ? "visible" : "hidden" }}
        />
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
        {/* Center overlay button */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Button size="lg" className="gap-2" onClick={toggleCamera}>
            {enableDetection ? "Stop Camera" : "Start Camera"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default LiveTracking;
