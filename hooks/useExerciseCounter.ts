"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import * as posedetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs";
import { useSession } from "next-auth/react";

export type ExerciseType =
  | "Push-Up"
  | "Pull-Up"
  | "Squat"
  | "Shoulder Press"
  | "Bicep Curl";

export type ExerciseCounts = {
  pushup: number;
  pullup: number;
  squat: number;
  shoulderPress: number;
  bicepCurl: number;
};

export function useExerciseCounter() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [poseDetector, setPoseDetector] = useState<posedetection.PoseDetector | null>(null);
  const [enableDetection, setEnableDetection] = useState<boolean>(false);
  const [currExercise, setCurrExercise] = useState<ExerciseType | null>(null);
  const [exerciseCounts, setExerciseCounts] = useState<ExerciseCounts>({
    pushup: 0,
    pullup: 0,
    squat: 0,
    shoulderPress: 0,
    bicepCurl: 0,
  });
  const totalReps =
    exerciseCounts.pushup +
    exerciseCounts.pullup +
    exerciseCounts.squat +
    exerciseCounts.shoulderPress +
    exerciseCounts.bicepCurl;
  const { data: session } = useSession();

  // Refs to track movement state for counting reps.
  const pushUpDownRef = useRef<boolean>(false);
  const pullUpDownRef = useRef<boolean>(false);
  const squatDownRef = useRef<boolean>(false);
  const shoulderPressDownRef = useRef<boolean>(false);
  const bicepCurlDownRef = useRef<boolean>(false);

  // Utility: calculate the angle (in degrees) between three keypoints (A, B, C)
  const calculateAngle = (
    A: posedetection.Keypoint,
    B: posedetection.Keypoint,
    C: posedetection.Keypoint
  ) => {
    const angle =
      Math.atan2(C.y - B.y, C.x - B.x) - Math.atan2(A.y - B.y, A.x - B.x);
    let degree = Math.abs((angle * 180) / Math.PI);
    if (degree > 180) degree = 360 - degree;
    return degree;
  };

  useEffect(() => {
    async function initDetector() {
      await tf.ready();
      const detectorConfig = {
        modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      };
      const detector = await posedetection.createDetector(
        posedetection.SupportedModels.MoveNet,
        detectorConfig
      );
      setPoseDetector(detector);
    }
    initDetector();
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    async function startCamera() {
      if (enableDetection && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        } catch (err) {
          console.error("Camera error:", err);
        }
      }
    }
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [enableDetection]);

  useEffect(() => {
    if (enableDetection && !currExercise) {
      setCurrExercise("Squat");
    }
  }, [enableDetection, currExercise]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!poseDetector || !enableDetection || !videoRef.current) return;
      const video = videoRef.current;
      if (video.readyState < 2) return;
      if (
        canvasRef.current &&
        video.videoWidth &&
        video.videoHeight &&
        (canvasRef.current.width !== video.videoWidth ||
          canvasRef.current.height !== video.videoHeight)
      ) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
      }
      const poses = await poseDetector.estimatePoses(video);
      if (poses && poses.length > 0) {
        const pose = poses[0];
        if (currExercise) {
          switch (currExercise) {
            case "Push-Up": {
              const leftAngle = calculateAngle(
                pose.keypoints[5],
                pose.keypoints[7],
                pose.keypoints[9]
              );
              const rightAngle = calculateAngle(
                pose.keypoints[6],
                pose.keypoints[8],
                pose.keypoints[10]
              );
              if (leftAngle < 90 && rightAngle < 90) {
                pushUpDownRef.current = true;
              }
              if (pushUpDownRef.current && leftAngle > 160 && rightAngle > 160) {
                setExerciseCounts((prev) => ({ ...prev, pushup: prev.pushup + 1 }));
                pushUpDownRef.current = false;
              }
              break;
            }
            case "Pull-Up": {
              const leftAngle = calculateAngle(
                pose.keypoints[5],
                pose.keypoints[7],
                pose.keypoints[9]
              );
              const rightAngle = calculateAngle(
                pose.keypoints[6],
                pose.keypoints[8],
                pose.keypoints[10]
              );
              if (leftAngle > 160 && rightAngle > 160) {
                pullUpDownRef.current = true;
              }
              if (pullUpDownRef.current && leftAngle < 50 && rightAngle < 50) {
                setExerciseCounts((prev) => ({ ...prev, pullup: prev.pullup + 1 }));
                pullUpDownRef.current = false;
              }
              break;
            }
            case "Squat": {
              const leftKneeAngle = calculateAngle(
                pose.keypoints[11],
                pose.keypoints[13],
                pose.keypoints[15]
              );
              const rightKneeAngle = calculateAngle(
                pose.keypoints[12],
                pose.keypoints[14],
                pose.keypoints[16]
              );
              if (leftKneeAngle < 90 && rightKneeAngle < 90) {
                squatDownRef.current = true;
              }
              if (squatDownRef.current && leftKneeAngle > 160 && rightKneeAngle > 160) {
                setExerciseCounts((prev) => ({ ...prev, squat: prev.squat + 1 }));
                squatDownRef.current = false;
              }
              break;
            }
            case "Shoulder Press": {
              const leftAngle = calculateAngle(
                pose.keypoints[5],
                pose.keypoints[7],
                pose.keypoints[9]
              );
              const rightAngle = calculateAngle(
                pose.keypoints[6],
                pose.keypoints[8],
                pose.keypoints[10]
              );
              if (leftAngle > 160 && rightAngle > 160) {
                shoulderPressDownRef.current = true;
              }
              if (shoulderPressDownRef.current && (leftAngle < 90 || rightAngle < 90)) {
                setExerciseCounts((prev) => ({
                  ...prev,
                  shoulderPress: prev.shoulderPress + 1,
                }));
                shoulderPressDownRef.current = false;
              }
              break;
            }
            case "Bicep Curl": {
              const leftAngle = calculateAngle(
                pose.keypoints[5],
                pose.keypoints[7],
                pose.keypoints[9]
              );
              const rightAngle = calculateAngle(
                pose.keypoints[6],
                pose.keypoints[8],
                pose.keypoints[10]
              );
              if (leftAngle < 50 && rightAngle < 50) {
                bicepCurlDownRef.current = true;
              }
              if (bicepCurlDownRef.current && leftAngle > 150 && rightAngle > 150) {
                setExerciseCounts((prev) => ({
                  ...prev,
                  bicepCurl: prev.bicepCurl + 1,
                }));
                bicepCurlDownRef.current = false;
              }
              break;
            }
            default:
              break;
          }
        }
        drawPose(pose);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [poseDetector, enableDetection, currExercise, calculateAngle]);


  const drawPose = useCallback((pose: posedetection.Pose) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    const threshold = 0.3;
    // Draw keypoints.
    pose.keypoints.forEach((kp, index) => {
      if (kp.score && kp.score > threshold && kp.x >= 0 && kp.y >= 0) {
        ctx.beginPath();
        // For wrists, draw larger blue circles.
        if (index === 9 || index === 10) {
          ctx.arc(kp.x, kp.y, 8, 0, 2 * Math.PI);
          ctx.fillStyle = "blue";
        } else {
          ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = "red";
        }
        ctx.fill();
      }
    });
    const adjacentPairs = posedetection.util.getAdjacentPairs(
      posedetection.SupportedModels.MoveNet
    );
    adjacentPairs.forEach(([i, j]) => {
      const kp1 = pose.keypoints[i];
      const kp2 = pose.keypoints[j];
      if (
        kp1.score! > threshold &&
        kp2.score! > threshold &&
        kp1.x >= 0 &&
        kp1.y >= 0 &&
        kp2.x >= 0 &&
        kp2.y >= 0
      ) {
        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
    ctx.restore();
  }, []);

  useEffect(() => {
    if (totalReps > 0) {
      const newCalories = totalReps * 5;
      const newTokens = totalReps * 10;
      const timer = setTimeout(() => {
        fetch("/api/user/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session?.user?.email,
            calories: newCalories,
            tokens: newTokens,
          }),
        }).catch((err) => console.error(err));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [exerciseCounts, totalReps, session]);

  const toggleCamera = () => {
    setEnableDetection((prev) => !prev);
  };

  return {
    exerciseCounts,
    totalReps,
    videoRef,
    canvasRef,
    enableDetection,
    toggleCamera,
    currExercise,
    setCurrExercise,
  };
}

export default useExerciseCounter;
