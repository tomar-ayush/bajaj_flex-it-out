"use client";

import * as posedetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import { useEffect, useRef, useState } from "react";

function calculateAngle(
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
  squat: { count: number; isSquatting: boolean };
  pushup: { count: number; isDown: boolean };
  crunch: { count: number; isCrunching: boolean };
}

export function useExerciseCounter() {
  const [initialized, setInitialized] = useState(false);
  const [exerciseState, setExerciseState] = useState<ExerciseState>({
    squat: { count: 0, isSquatting: false },
    pushup: { count: 0, isDown: false },
    crunch: { count: 0, isCrunching: false },
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectorRef = useRef<posedetection.PoseDetector | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const squatFlagRef = useRef(false);
  const squatBufferRef = useRef<number[]>([]);
  const bufferSize = 5;
  function getSmoothedAngle(angle: number): number {
    const buffer = squatBufferRef.current;
    buffer.push(angle);
    if (buffer.length > bufferSize) {
      buffer.shift();
    }
    return buffer.reduce((acc, val) => acc + val, 0) / buffer.length;
  }

  useEffect(() => {
    async function initTF() {
      try {
        await tf.setBackend("webgl");
        await tf.ready();
        setInitialized(true);
      } catch (err) {
        console.error("TF backend init error:", err);
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
        console.error("Detector init error:", err);
      }
    }
    initDetector();
  }, [initialized]);

  useEffect(() => {
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

    async function detectPoses() {
      if (
        detectorRef.current &&
        videoRef.current &&
        videoRef.current.readyState === 4 &&
        canvasRef.current
      ) {
        try {
          const poses = await detectorRef.current.estimatePoses(
            videoRef.current
          );
          if (poses && poses.length > 0) {
            const pose = poses[0];
            const keypoints = pose.keypoints;

            // Draw keypoints & skeleton
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
              ctx.clearRect(
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
              );
              drawKeypoints(keypoints, ctx);
              drawSkeleton(keypoints, ctx);
            }

            const nose = keypoints.find((kp: any) => kp.name === "nose");
            const leftShoulder = keypoints.find(
              (kp: any) => kp.name === "left_shoulder"
            );
            const rightShoulder = keypoints.find(
              (kp: any) => kp.name === "right_shoulder"
            );

            const isPushup =
              nose &&
              leftShoulder &&
              rightShoulder &&
              Math.abs(nose.y - (leftShoulder.y + rightShoulder.y) / 2) < 20;

            if (!isPushup) {
              const leftHip = keypoints.find(
                (kp: any) => kp.name === "left_hip"
              );
              const leftKnee = keypoints.find(
                (kp: any) => kp.name === "left_knee"
              );
              const leftAnkle = keypoints.find(
                (kp: any) => kp.name === "left_ankle"
              );

              if (leftHip && leftKnee && leftAnkle) {
                const rawAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
                const smoothAngle = getSmoothedAngle(rawAngle);

                if (smoothAngle < 70 && !squatFlagRef.current) {
                  squatFlagRef.current = true;
                } else if (smoothAngle > 140 && squatFlagRef.current) {
                  squatFlagRef.current = false;
                  setExerciseState((prev) => ({
                    ...prev,
                    squat: {
                      count: prev.squat.count + 1,
                      isSquatting: false,
                    },
                  }));
                }
              }
            }
          }
        } catch (err) {
          console.error("Pose detection error:", err);
        }
      }
      animationFrameRef.current = requestAnimationFrame(detectPoses);
    }

    if (initialized) {
      detectPoses();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initialized]);

  return { exerciseState, videoRef, canvasRef };
}

export { calculateAngle };
