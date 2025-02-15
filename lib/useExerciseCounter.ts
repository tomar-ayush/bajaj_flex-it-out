"use client";

import * as posedetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import { useEffect, useRef, useState, useCallback } from "react";

function calculateAngle(
  A: { x: number; y: number },
  B: { x: number; y: number },
  C: { x: number; y: number }
): number {
  // Angle at point B formed by A-B-C using the cosine law.
  const AB = Math.hypot(B.x - A.x, B.y - A.y);
  const BC = Math.hypot(B.x - C.x, B.y - C.y);
  const AC = Math.hypot(C.x - A.x, C.y - A.y);
  const angleRad = Math.acos((AB ** 2 + BC ** 2 - AC ** 2) / (2 * AB * BC));
  return (angleRad * 180) / Math.PI;
}

interface ExerciseState {
  squat: { count: number; active: boolean };
  pushup: { count: number; active: boolean };
  crunch: { count: number; active: boolean };
}

export function useExerciseCounter() {
  const [initialized, setInitialized] = useState(false);
  const [exerciseState, setExerciseState] = useState<ExerciseState>({
    squat: { count: 0, active: false },
    pushup: { count: 0, active: false },
    crunch: { count: 0, active: false },
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectorRef = useRef<posedetection.PoseDetector | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Use refs to track if an exercise is in its “active” phase.
  const squatActiveRef = useRef(false);
  const pushupActiveRef = useRef(false);
  const crunchActiveRef = useRef(false);

  useEffect(() => {
    async function initTF() {
      try {
        await tf.setBackend("webgl");
        await tf.ready();
        detectorRef.current = await posedetection.createDetector(
          posedetection.SupportedModels.MoveNet,
          { modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        );
        setInitialized(true);
      } catch (err) {
        console.error("Initialization error:", err);
      }
    }
    initTF();
    return () => {
      if (detectorRef.current) {
        detectorRef.current.dispose();
      }
    };
  }, []);

  // Optional: separate drawing logic (for visualization)
  const drawKeypoints = useCallback((keypoints: posedetection.Keypoint[]) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !videoRef.current || !canvasRef.current) return;
    // Resize canvas to match video
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    // Draw each keypoint
    keypoints.forEach((kp) => {
      if (kp.score && kp.score > 0.3) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }
    });
    // Draw connections (example list)
    const connections: [string, string][] = [
      ["left_hip", "left_knee"],
      ["left_knee", "left_ankle"],
      ["right_hip", "right_knee"],
      ["right_knee", "right_ankle"],
      ["left_shoulder", "left_elbow"],
      ["left_elbow", "left_wrist"],
      ["right_shoulder", "right_elbow"],
      ["right_elbow", "right_wrist"],
      ["left_shoulder", "right_shoulder"],
      ["left_hip", "right_hip"],
      ["left_shoulder", "left_hip"],
      ["right_shoulder", "right_hip"],
    ];
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 2;
    connections.forEach(([p1, p2]) => {
      const point1 = keypoints.find((kp) => kp.name === p1);
      const point2 = keypoints.find((kp) => kp.name === p2);
      if (point1 && point2 && point1.score! > 0.3 && point2.score! > 0.3) {
        ctx.beginPath();
        ctx.moveTo(point1.x, point1.y);
        ctx.lineTo(point2.x, point2.y);
        ctx.stroke();
      }
    });
  }, []);

  useEffect(() => {
    if (!initialized) return;

    async function detectPoses() {
      if (!videoRef.current || !canvasRef.current || !detectorRef.current) {
        animationFrameRef.current = requestAnimationFrame(detectPoses);
        return;
      }

      try {
        if (videoRef.current.readyState < 2) {
          animationFrameRef.current = requestAnimationFrame(detectPoses);
          return;
        }
        const poses = await detectorRef.current.estimatePoses(videoRef.current);
        if (poses.length > 0) {
          const pose = poses[0];
          const keypoints = pose.keypoints;
          drawKeypoints(keypoints);

          // --- Squat detection ---
          // Use left hip and knee positions.
          const leftHip = keypoints.find((kp) => kp.name === "left_hip");
          const leftKnee = keypoints.find((kp) => kp.name === "left_knee");
          if (leftHip && leftKnee && leftHip.score! > 0.3 && leftKnee.score! > 0.3) {
            if (leftHip.y > leftKnee.y && !squatActiveRef.current) {
              // Enter squat posture
              squatActiveRef.current = true;
            } else if (leftHip.y < leftKnee.y && squatActiveRef.current) {
              // Only update one rep per full cycle
              squatActiveRef.current = false;
              setExerciseState((prev) => ({
                ...prev,
                squat: { count: prev.squat.count + 1, active: false },
              }));
            }
          }

          // --- Push-up detection ---
          // Use left shoulder, elbow, and wrist to calculate the elbow angle.
          const leftShoulder = keypoints.find((kp) => kp.name === "left_shoulder");
          const leftElbow = keypoints.find((kp) => kp.name === "left_elbow");
          const leftWrist = keypoints.find((kp) => kp.name === "left_wrist");
          if (
            leftShoulder &&
            leftElbow &&
            leftWrist &&
            leftShoulder.score! > 0.3 &&
            leftElbow.score! > 0.3 &&
            leftWrist.score! > 0.3
          ) {
            const elbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
            if (elbowAngle < 90 && !pushupActiveRef.current) {
              pushupActiveRef.current = true;
            } else if (elbowAngle > 160 && pushupActiveRef.current) {
              pushupActiveRef.current = false;
              setExerciseState((prev) => ({
                ...prev,
                pushup: { count: prev.pushup.count + 1, active: false },
              }));
            }
          }

          // --- Crunch detection ---
          // Use nose and right hip vertical distance.
          const nose = keypoints.find((kp) => kp.name === "nose");
          const rightHip = keypoints.find((kp) => kp.name === "right_hip");
          if (nose && rightHip && nose.score! > 0.3 && rightHip.score! > 0.3) {
            const verticalDistance = Math.abs(nose.y - rightHip.y);
            if (verticalDistance < 100 && !crunchActiveRef.current) {
              crunchActiveRef.current = true;
            } else if (verticalDistance > 150 && crunchActiveRef.current) {
              crunchActiveRef.current = false;
              setExerciseState((prev) => ({
                ...prev,
                crunch: { count: prev.crunch.count + 1, active: false },
              }));
            }
          }
        }
      } catch (err) {
        console.error("Pose detection error:", err);
      }
      animationFrameRef.current = requestAnimationFrame(detectPoses);
    }
    detectPoses();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initialized, drawKeypoints]);

  return { exerciseState, videoRef, canvasRef };
}

export { calculateAngle };
