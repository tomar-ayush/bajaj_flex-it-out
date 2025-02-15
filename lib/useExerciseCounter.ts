"use client";
import { toast } from "@/hooks/use-toast";
import * as posedetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import { useEffect, useRef, useState } from "react";

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
  const magBA = Math.sqrt(BAx ** 2 + BAy ** 2);
  const magBC = Math.sqrt(BCx ** 2 + BCy ** 2);
  if (magBA === 0 || magBC === 0) return 0;
  const angleRad = Math.acos(dotProduct / (magBA * magBC));
  return (angleRad * 180) / Math.PI;
}

interface ExerciseState {
  squat: number;
  pushup: number;
  crunch: number;
}

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
  
  const DEBOUNCE_TIME = 30000; // 3 s
  const toastLastTime = useRef<{ [key: string]: number }>({});
  function maybeToastError(key: string, message: string, variant: "destructive" | "success") {
    const now = Date.now();
    if (!toastLastTime.current[key] || now - toastLastTime.current[key] > DEBOUNCE_TIME) {
      toast({ title: message, variant });
      toastLastTime.current[key] = now;
    }
  }
  
  const squatCooldown = useRef(false);
  const pushupCooldown = useRef(false);
  const crunchCooldown = useRef(false);
  
  const ALPHA = 0.2;
  const squatSmooth = useRef<number | null>(null);
  const pushupSmooth = useRef<number | null>(null);
  const crunchSmooth = useRef<number | null>(null);
  const exponentialSmooth = (newVal: number, prevVal: number | null): number =>
    prevVal === null ? newVal : ALPHA * newVal + (1 - ALPHA) * prevVal;
  
  const pushupDown = useRef(false);
  
  const squatPrevAngle = useRef<number | null>(null);
  const squatMinAngle = useRef<number>(Infinity);
  
  const crunchPrevAngle = useRef<number | null>(null);
  const crunchMinAngle = useRef<number>(Infinity);
  
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
  
  function drawKeypoints(keypoints: any, ctx: CanvasRenderingContext2D) {
    keypoints.forEach((kp: any) => {
      if (kp.score > 0.5) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }
    });
  }
  
  function drawSkeleton(keypoints: any, ctx: CanvasRenderingContext2D) {
    const connections = [
      ["left_hip", "left_knee"],
      ["left_knee", "left_ankle"],
      ["left_shoulder", "left_hip"],
      ["left_shoulder", "left_elbow"],
      ["left_elbow", "left_wrist"],
      ["right_hip", "right_knee"],
      ["right_knee", "right_ankle"],
      ["right_shoulder", "right_hip"],
      ["right_shoulder", "right_elbow"],
      ["right_elbow", "right_wrist"],
    ];
    connections.forEach(([a, b]) => {
      const pointA = keypoints.find((kp: any) => kp.name === a);
      const pointB = keypoints.find((kp: any) => kp.name === b);
      if (pointA && pointB && pointA.score > 0.5 && pointB.score > 0.5) {
        ctx.beginPath();
        ctx.moveTo(pointA.x, pointA.y);
        ctx.lineTo(pointB.x, pointB.y);
        ctx.strokeStyle = "lime";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }
  
  
  // When the average elbow angle falls below 70°, mark as "down."
  // When it recovers above 150° with a delta >20°, count a rep.
  function detectPushup(keypoints: any): boolean {
    const leftShoulder = keypoints.find((kp: any) => kp.name === "left_shoulder");
    const rightShoulder = keypoints.find((kp: any) => kp.name === "right_shoulder");
    const leftElbow = keypoints.find((kp: any) => kp.name === "left_elbow");
    const rightElbow = keypoints.find((kp: any) => kp.name === "right_elbow");
    const leftWrist = keypoints.find((kp: any) => kp.name === "left_wrist");
    const rightWrist = keypoints.find((kp: any) => kp.name === "right_wrist");
    const leftHip = keypoints.find((kp: any) => kp.name === "left_hip");
    
    if (!leftShoulder || !rightShoulder || !leftElbow || !rightElbow || !leftWrist || !rightWrist || !leftHip) {
      maybeToastError("pushup-missing", "Pushup error: Missing keypoints.", "destructive");
      return false;
    }
    // Tolerance for minor deviations.
    const tol = 5;
    if (!(leftWrist.y > leftShoulder.y - tol && rightWrist.y > rightShoulder.y - tol)) {
      maybeToastError("pushup-wrists", "Pushup posture: Ensure wrists are below shoulders.", "destructive");
      return false;
    }
    if (Math.abs(leftHip.y - leftShoulder.y) > 20) {
      maybeToastError("pushup-torso", "Pushup posture: Keep your torso horizontal.", "destructive");
      return false;
    }
  
    const leftAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
    const rightAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
    const rawAngle = (leftAngle + rightAngle) / 2;
    const smoothAngle = exponentialSmooth(rawAngle, pushupSmooth.current);
    pushupSmooth.current = smoothAngle;
    console.log("Pushup Angle:", smoothAngle.toFixed(2));
  
    if (!pushupDown.current && smoothAngle < 70) {
      pushupDown.current = true;
    } else if (pushupDown.current && smoothAngle > 150 && (smoothAngle - 70) > 20 && !pushupCooldown.current) {
      pushupCooldown.current = true;
      setTimeout(() => { pushupCooldown.current = false; }, COOLDOWN);
      console.log("Pushup rep counted!");
      pushupDown.current = false;
      return true;
    }
    return false;
  }
  
  // Squat detection: Uses knee angle (hip-knee-ankle).
  // Counts a rep if the knee angle drops below ~85° then recovers above ~125°.
  function detectSquat(keypoints: any): boolean {
    const shoulder = keypoints.find((kp: any) => kp.name === "left_shoulder");
    const hip = keypoints.find((kp: any) => kp.name === "left_hip");
    const knee = keypoints.find((kp: any) => kp.name === "left_knee");
    const ankle = keypoints.find((kp: any) => kp.name === "left_ankle");
    if (shoulder && hip && knee && ankle) {
      if (hip.y > shoulder.y + 20 && knee.y > hip.y + 15) {
        const rawAngle = calculateAngle(hip, knee, ankle);
        const smoothAngle = exponentialSmooth(rawAngle, squatSmooth.current);
        squatSmooth.current = smoothAngle;
        console.log("Squat Angle:", smoothAngle.toFixed(2));
        if (squatPrevAngle.current === null) {
          squatPrevAngle.current = smoothAngle;
          squatMinAngle.current = smoothAngle;
          return false;
        }
        if (smoothAngle < squatPrevAngle.current) {
          if (smoothAngle < squatMinAngle.current) {
            squatMinAngle.current = smoothAngle;
          }
        } else {
          if (squatMinAngle.current < 85 && smoothAngle > 125 && !squatCooldown.current) {
            squatCooldown.current = true;
            setTimeout(() => { squatCooldown.current = false; }, COOLDOWN);
            console.log("Squat rep counted!");
            squatPrevAngle.current = smoothAngle;
            squatMinAngle.current = Infinity;
            return true;
          }
        }
        squatPrevAngle.current = smoothAngle;
      }
    }
    return false;
  }
  
  // Counts a rep if the angle drops below ~100° then recovers above ~160°.
  // Also ensures the nose is sufficiently above the shoulder.
  function detectCrunch(keypoints: any): boolean {
    const nose = keypoints.find((kp: any) => kp.name === "nose");
    const shoulder = keypoints.find((kp: any) => kp.name === "left_shoulder");
    const hip = keypoints.find((kp: any) => kp.name === "left_hip");
    const knee = keypoints.find((kp: any) => kp.name === "left_knee");
    if (nose && shoulder && hip && knee) {
      if (nose.y <= shoulder.y + 5) {
        maybeToastError("crunch-posture", "Crunch posture: Lift your head slightly.", "destructive");
        return false;
      }
      const rawAngle = calculateAngle(shoulder, hip, knee);
      const smoothAngle = exponentialSmooth(rawAngle, crunchSmooth.current);
      crunchSmooth.current = smoothAngle;
      console.log("Crunch Angle:", smoothAngle.toFixed(2));
      if (crunchPrevAngle.current === null) {
        crunchPrevAngle.current = smoothAngle;
        crunchMinAngle.current = smoothAngle;
        return false;
      }
      if (smoothAngle < crunchPrevAngle.current) {
        if (smoothAngle < crunchMinAngle.current) {
          crunchMinAngle.current = smoothAngle;
        }
      } else {
        if ((smoothAngle - crunchMinAngle.current) > 20 && crunchMinAngle.current < 100 && smoothAngle > 160 && !crunchCooldown.current) {
          crunchCooldown.current = true;
          setTimeout(() => { crunchCooldown.current = false; }, COOLDOWN);
          console.log("Crunch rep counted!");
          crunchPrevAngle.current = smoothAngle;
          crunchMinAngle.current = Infinity;
          return true;
        }
      }
      crunchPrevAngle.current = smoothAngle;
    } else {
      maybeToastError("crunch-missing", "Crunch error: Missing keypoints.", "destructive");
    }
    return false;
  }
  
  useEffect(() => {
    async function detectPoses() {
      if (!detectorRef.current || !videoRef.current || videoRef.current.readyState !== 4 || !canvasRef.current) {
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
            drawKeypoints(keypoints, ctx);
            drawSkeleton(keypoints, ctx);
          }
          let repCounted = false;
          const leftShoulder = keypoints.find((kp: any) => kp.name === "left_shoulder");
          const leftHip = keypoints.find((kp: any) => kp.name === "left_hip");
          const verticalDiff = leftShoulder && leftHip ? leftHip.y - leftShoulder.y : 100;
          // For pushups, require verticalDiff < 40.
          if (verticalDiff < 40) {
            if (!repCounted && detectPushup(keypoints)) {
              // Standard vs. knee pushup differentiation.
              if (verticalDiff < 20) {
                setExerciseState(prev => ({ ...prev, pushup: prev.pushup + 1 }));
                console.log("Standard pushup counted");
              } else {
                setExerciseState(prev => ({ ...prev, pushup: prev.pushup + 0.5 }));
                console.log("Knee pushup counted (0.5)");
              }
              repCounted = true;
            }
          } else {
            if (!repCounted && detectSquat(keypoints)) {
              setExerciseState(prev => ({ ...prev, squat: prev.squat + 1 }));
              repCounted = true;
            } else if (!repCounted && detectCrunch(keypoints)) {
              setExerciseState(prev => ({ ...prev, crunch: prev.crunch + 1 }));
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
  
  return { exerciseState, videoRef, canvasRef };
}
