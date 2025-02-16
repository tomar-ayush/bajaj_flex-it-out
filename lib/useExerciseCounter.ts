"use client";
import { toast } from "@/hooks/use-toast";
import * as posedetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import { useEffect, useRef, useState } from "react";

// Calculates the angle (in degrees) at point B formed by points A, B, and C.
export function calculateAngle(
  A: { x: number; y: number },
  B: { x: number; y: number },
  C: { x: number; y: number }
): number {
  const BAx = A.x - B.x;
  const BAy = A.y - B.y;
  const BCx = C.x - B.x;
  const BCy = C.y - B.y;
  const dotProduct = BAx * BCx + BAy * BCy;
  const magBA = Math.hypot(BAx, BAy);
  const magBC = Math.hypot(BCx, BCy);
  if (magBA === 0 || magBC === 0) return 0;
  const angleRad = Math.acos(dotProduct / (magBA * magBC));
  return (angleRad * 180) / Math.PI;
}

interface ExerciseState {
  squat: number;
  pushup: number;
  crunch: number;
}

type Mode = "pushup" | "squat" | "crunch" | null;

export function useExerciseCounter() {
  const [initialized, setInitialized] = useState(false);
  const [exerciseState, setExerciseState] = useState<ExerciseState>({
    squat: 0,
    pushup: 0,
    crunch: 0,
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectorRef = useRef<posedetection.PoseDetector | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const COOLDOWN = 1000;
  const DEBOUNCE_TIME = 30000;
  const toastLastTime = useRef<{ [key: string]: number }>({});

  function maybeToastError(key: string, message: string, variant: "destructive" | "success") {
    const now = Date.now();
    if (!toastLastTime.current[key] || now - toastLastTime.current[key] > DEBOUNCE_TIME) {
      toast({ title: message, variant });
      toastLastTime.current[key] = now;
    }
  }

  // Smoothing utility.
  const ALPHA = 0.2;
  const exponentialSmooth = (newVal: number, prevVal: number | null): number =>
    prevVal === null ? newVal : ALPHA * newVal + (1 - ALPHA) * prevVal;

  // -----------------
  // PUSHUP STATE (unchanged from before)
  const pushupState = useRef<"up" | "down">("up");
  const pushupBaseline:any = useRef<number | null>(null);

  // -----------------
  // SQUAT STATE: Now we use a dynamic mid‑hip baseline.
  const squatState = useRef<"up" | "down">("up");
  const squatBaseline:any = useRef<number | null>(null);
  const squatSmooth = useRef<number | null>(null);

  // CLASSIFICATION: Use torso orientation (mid-shoulder to mid-hip) to decide mode.
  function classifyExercise(keypoints: any): Mode {
    const leftShoulder = keypoints.find((kp: any) => kp.name === "left_shoulder");
    const rightShoulder = keypoints.find((kp: any) => kp.name === "right_shoulder");
    const leftHip = keypoints.find((kp: any) => kp.name === "left_hip");
    const rightHip = keypoints.find((kp: any) => kp.name === "right_hip");
    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return null;
    const midShoulder = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2,
    };
    const midHip = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2,
    };
    const dx = midHip.x - midShoulder.x;
    const dy = midHip.y - midShoulder.y;
    let torsoAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    torsoAngle = Math.abs(torsoAngle);
    // Nearly horizontal torso implies pushup.
    if (torsoAngle < 45 || torsoAngle > 135) return "pushup";
    // Otherwise, assume squat.
    return "squat";
  }

  // PUSHUP REP DETECTION (unchanged).
  function detectPushup(keypoints: any): boolean {
    const leftShoulder = keypoints.find((kp: any) => kp.name === "left_shoulder");
    const rightShoulder = keypoints.find((kp: any) => kp.name === "right_shoulder");
    const nose = keypoints.find((kp: any) => kp.name === "nose");
    if (!leftShoulder || !rightShoulder || !nose) {
      maybeToastError("pushup-missing", "Pushup error: Missing keypoints.", "destructive");
      return false;
    }
    const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const bodySegment = Math.abs(midShoulderY - nose.y);
    if (pushupBaseline.current === null && pushupState.current === "up") {
      pushupBaseline.current = midShoulderY;
      return false;
    }
    if (pushupState.current === "up" && (pushupBaseline.current - midShoulderY) > (0.15 * bodySegment)) {
      pushupState.current = "down";
      return false;
    }
    if (pushupState.current === "down" && (pushupBaseline.current - midShoulderY) < (0.05 * bodySegment)) {
      pushupState.current = "up";
      pushupBaseline.current = midShoulderY;
      console.log("Pushup rep counted!");
      return true;
    }
    return false;
  }

  // NEW SQUAT REP DETECTION: Uses a combined approach with knee angles and mid-hip vertical drop.
  function detectSquat(keypoints: any): boolean {
    const leftShoulder = keypoints.find((kp: any) => kp.name === "left_shoulder");
    const rightShoulder = keypoints.find((kp: any) => kp.name === "right_shoulder");
    const leftHip = keypoints.find((kp: any) => kp.name === "left_hip");
    const rightHip = keypoints.find((kp: any) => kp.name === "right_hip");
    const leftKnee = keypoints.find((kp: any) => kp.name === "left_knee");
    const rightKnee = keypoints.find((kp: any) => kp.name === "right_knee");
    const leftAnkle = keypoints.find((kp: any) => kp.name === "left_ankle");
    const rightAnkle = keypoints.find((kp: any) => kp.name === "right_ankle");
    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
      maybeToastError("squat-missing", "Squat error: Missing keypoints.", "destructive");
      return false;
    }
    // Compute mid-hip and mid-shoulder positions.
    const midHipY = (leftHip.y + rightHip.y) / 2;
    const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const torsoLength = Math.abs(midHipY - midShoulderY);
    // Initialize squat baseline if not set.
    if (squatBaseline.current === null && squatState.current === "up") {
      squatBaseline.current = midHipY;
      return false;
    }
    // Compute average knee angle.
    const leftAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
    let avgKneeAngle = (leftAngle + rightAngle) / 2;
    avgKneeAngle = exponentialSmooth(avgKneeAngle, squatSmooth.current);
    squatSmooth.current = avgKneeAngle;
    // Use both signals: mid-hip drop and knee angle.
    if (squatState.current === "up" && ((midHipY - squatBaseline.current) > (0.15 * torsoLength)) && avgKneeAngle < 80) {
      squatState.current = "down";
      return false;
    }
    if (squatState.current === "down" && ((midHipY - squatBaseline.current) < (0.05 * torsoLength)) && avgKneeAngle > 150) {
      squatState.current = "up";
      // Update baseline after a rep.
      squatBaseline.current = midHipY;
      console.log("Squat rep counted!");
      return true;
    }
    return false;
  }

  // MAIN POSE DETECTION LOOP.
  useEffect(() => {
    async function detectPoses() {
      if (
        !detectorRef.current ||
        !videoRef.current ||
        videoRef.current.readyState !== 4 ||
        !canvasRef.current
      ) {
        animationFrameRef.current = requestAnimationFrame(detectPoses);
        return;
      }
      try {
        const poses = await detectorRef.current.estimatePoses(videoRef.current);
        if (poses && poses.length > 0) {
          const pose = poses[0];
          const keypoints = pose.keypoints;
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            // Draw keypoints.
            keypoints.forEach((kp: any) => {
              if (kp.score > 0.5) {
                ctx.beginPath();
                ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = "red";
                ctx.fill();
              }
            });
            // If in squat mode, draw the baseline (green line) for visual reference.
            const mode = classifyExercise(keypoints);
            if (mode === "squat" && squatBaseline.current !== null) {
              ctx.beginPath();
              ctx.moveTo(0, squatBaseline.current);
              ctx.lineTo(canvasRef.current.width, squatBaseline.current);
              ctx.strokeStyle = "green";
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          }
          // Classify exercise mode.
          const mode = classifyExercise(keypoints);
          let repCounted = false;
          if (mode === "pushup") {
            if (!repCounted && detectPushup(keypoints)) {
              setExerciseState(prev => ({ ...prev, pushup: prev.pushup + 1 }));
              repCounted = true;
            }
          } else if (mode === "squat") {
            if (!repCounted && detectSquat(keypoints)) {
              setExerciseState(prev => ({ ...prev, squat: prev.squat + 1 }));
              repCounted = true;
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
      animationFrameRef.current = requestAnimationFrame(detectPoses);
    }
    if (initialized) {
      detectPoses();
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [initialized]);

  // Initialize TensorFlow and the pose detector.
  useEffect(() => {
    async function initTF() {
      try {
        await tf.setBackend("webgl");
        await tf.ready();
        setInitialized(true);
      } catch (err) {
        console.error(err);
      }
    }
    initTF();
  }, []);
  useEffect(() => {
    if (!initialized) return;
    async function initDetector() {
      try {
        detectorRef.current = await posedetection.createDetector(
          posedetection.SupportedModels.MoveNet,
          { modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        );
      } catch (err) {
        console.error(err);
      }
    }
    initDetector();
  }, [initialized]);

  return { exerciseState, videoRef, canvasRef };
}