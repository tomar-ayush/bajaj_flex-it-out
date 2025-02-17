"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import * as posedetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs";

export type ExerciseType = "Push-Up" | "Pull-Up" | "Squat";
export type ExerciseCounts = {
  pushup: number;
  pullup: number;
  squat: number;
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
  });
  const [pullDownFrames, setPullDownFrames] = useState(0);
  const [squatDownFrames, setSquatDownFrames] = useState(0);
  const totalReps = exerciseCounts.pushup + exerciseCounts.pullup + exerciseCounts.squat;
  
  const pushDownRef = useRef<number>(0);

  useEffect(() => {
    async function initDetector() {
      await tf.ready();
      const detectorConfig = {
        modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      };
      const detector = await posedetection.createDetector(posedetection.SupportedModels.MoveNet, detectorConfig);
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
        } catch (err) {
          console.error("Camera error:", err);
        }
      }
    }
    startCamera();
    return () => { if (stream) stream.getTracks().forEach((track) => track.stop()); };
  }, [enableDetection]);
  
  useEffect(() => {
    if (enableDetection && !currExercise) {
      setCurrExercise("Squat");
    }
  }, [enableDetection, currExercise]);
  
  const checkPushUpForm = useCallback((pose: posedetection.Pose) => {
    if (!pose.keypoints || pose.keypoints.length < 9) return;
    const lShoulder = pose.keypoints[6];
    const lElbow = pose.keypoints[8];
    const rShoulder = pose.keypoints[5];
    const rElbow = pose.keypoints[7];
    if (
      lShoulder.score! > 0.5 &&
      lElbow.score! > 0.5 &&
      rShoulder.score! > 0.5 &&
      rElbow.score! > 0.5
    ) {
      const isDown = lShoulder.y > lElbow.y || rShoulder.y > rElbow.y;
      const isUp = lShoulder.y <= lElbow.y && rShoulder.y <= rElbow.y;
      if (isDown) {
        pushDownRef.current++;
      } else {
        if (pushDownRef.current >= 3 && isUp) {
          setExerciseCounts(prev => ({ ...prev, pushup: prev.pushup + 1 }));
        }
        pushDownRef.current = 0;
      }
    }
  }, []);
  
  const checkPullUpForm = useCallback((pose: posedetection.Pose) => {
    if (!pose.keypoints || pose.keypoints.length < 9) return;
    const lShoulder = pose.keypoints[6];
    const lElbow = pose.keypoints[8];
    const rShoulder = pose.keypoints[5];
    const rElbow = pose.keypoints[7];
    if (
      lShoulder.score! > 0.5 &&
      lElbow.score! > 0.5 &&
      rShoulder.score! > 0.5 &&
      rElbow.score! > 0.5
    ) {
      const isDown = lShoulder.y > lElbow.y && rShoulder.y > rElbow.y;
      const isUp = lShoulder.y <= lElbow.y && rShoulder.y <= rElbow.y;
      if (isDown) {
        setPullDownFrames(prev => prev + 1);
      } else {
        if (pullDownFrames >= 3 && isUp) {
          setExerciseCounts(prev => ({ ...prev, pullup: prev.pullup + 1 }));
        }
        setPullDownFrames(0);
      }
    }
  }, [pullDownFrames]);
  
  const checkSquatForm = useCallback((pose: posedetection.Pose) => {
    if (!pose.keypoints || pose.keypoints.length < 15) return;
    const lHip = pose.keypoints[11];
    const lKnee = pose.keypoints[13];
    const rHip = pose.keypoints[12];
    const rKnee = pose.keypoints[14];
    if (
      lHip.score! > 0.5 &&
      lKnee.score! > 0.5 &&
      rHip.score! > 0.5 &&
      rKnee.score! > 0.5
    ) {
      const isDown = lHip.y >= lKnee.y - 10 || rHip.y >= rKnee.y - 10;
      const isUp = lHip.y < lKnee.y + 10 && rHip.y < rKnee.y + 10;
      if (isDown) {
        setSquatDownFrames(prev => prev + 1);
      } else {
        if (squatDownFrames >= 3 && isUp) {
          setExerciseCounts(prev => ({ ...prev, squat: prev.squat + 1 }));
        }
        setSquatDownFrames(0);
      }
    }
  }, [squatDownFrames]);
  
  const drawPose = useCallback((pose: posedetection.Pose) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.translate(canvasRef.current.width, 0);
    ctx.scale(-1, 1);
    pose.keypoints.forEach((kp) => {
      if (kp.score && kp.score > 0.5 && kp.x >= 0 && kp.y >= 0) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }
    });
    const adjacentPairs = posedetection.util.getAdjacentPairs(posedetection.SupportedModels.MoveNet);
    adjacentPairs.forEach(([i, j]) => {
      const kp1 = pose.keypoints[i];
      const kp2 = pose.keypoints[j];
      if (
        kp1.score! > 0.5 &&
        kp2.score! > 0.5 &&
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
        if (currExercise === "Push-Up") checkPushUpForm(pose);
        if (currExercise === "Pull-Up") checkPullUpForm(pose);
        if (currExercise === "Squat") checkSquatForm(pose);
        drawPose(pose);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [poseDetector, enableDetection, currExercise, checkPushUpForm, checkPullUpForm, checkSquatForm]);
  
  const toggleCamera = () => {
    setEnableDetection(prev => !prev);
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