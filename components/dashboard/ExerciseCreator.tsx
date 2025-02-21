"use client";
import React, { useState, useRef, useEffect } from "react";
import * as posedetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs";

export interface NewExerciseConfig {
  name: string;
  keyAngles: { [key: string]: number };
  keypoints: posedetection.Keypoint[];
}

interface ExerciseCreatorProps {
  poseDetector: posedetection.PoseDetector | null;
  onExerciseCreated: (config: NewExerciseConfig) => void;
}

export function ExerciseCreator({ poseDetector, onExerciseCreated }: ExerciseCreatorProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [exerciseName, setExerciseName] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload and convert to data URL.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Draw the image and (if available) detected keypoints.
  useEffect(() => {
    if (imageSrc && poseDetector && canvasRef.current) {
      const image = new Image();
      image.onload = async () => {
        const canvas = canvasRef.current!;
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(image, 0, 0, image.width, image.height);
        // Run pose detection on the image.
        const poses = await poseDetector.estimatePoses(image);
        if (poses && poses.length > 0) {
          const pose = poses[0];
          // Draw keypoints with a lower threshold so that wrists are visible.
          const threshold = 0.3;
          pose.keypoints.forEach((kp, index) => {
            if (kp.score && kp.score > threshold) {
              ctx.beginPath();
              // Draw wrists (indices 9 and 10) larger and in blue.
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
          // Draw skeleton lines.
          const adjacentPairs = posedetection.util.getAdjacentPairs(posedetection.SupportedModels.MoveNet);
          adjacentPairs.forEach(([i, j]) => {
            const kp1 = pose.keypoints[i];
            const kp2 = pose.keypoints[j];
            if (
              kp1.score! > threshold &&
              kp2.score! > threshold
            ) {
              ctx.beginPath();
              ctx.moveTo(kp1.x, kp1.y);
              ctx.lineTo(kp2.x, kp2.y);
              ctx.strokeStyle = "white";
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          });
        }
      };
      image.src = imageSrc;
    }
  }, [imageSrc, poseDetector]);

  // Utility to calculate an angle (in degrees) between three keypoints.
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

  // When the user clicks "Create Exercise", run pose detection again and extract angles.
  const handleCreateExercise = async () => {
    if (!poseDetector || !imageSrc) return;
    const image = new Image();
    image.onload = async () => {
      const poses = await poseDetector.estimatePoses(image);
      if (poses && poses.length > 0) {
        const pose = poses[0];
        // For example, calculate left and right elbow angles.
        const leftElbowAngle = calculateAngle(
          pose.keypoints[5], // left shoulder
          pose.keypoints[7], // left elbow
          pose.keypoints[9]  // left wrist
        );
        const rightElbowAngle = calculateAngle(
          pose.keypoints[6], // right shoulder
          pose.keypoints[8], // right elbow
          pose.keypoints[10] // right wrist
        );
        const newExercise = {
          name: exerciseName || "New Exercise",
          keyAngles: {
            leftElbowAngle,
            rightElbowAngle,
          },
          keypoints: pose.keypoints,
        };
        onExerciseCreated(newExercise);
      }
    };
    image.src = imageSrc;
  };

  return (
    <div style={{ padding: "1rem", border: "1px solid #ccc", marginTop: "1rem" }}>
      <h2>Create New Exercise</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
      {imageSrc && (
        <div>
          <canvas ref={canvasRef} style={{ border: "1px solid #ccc", maxWidth: "100%", marginTop: "1rem" }} />
          <div style={{ marginTop: "0.5rem" }}>
            <input
              type="text"
              placeholder="Enter exercise name"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
            />
            <button onClick={handleCreateExercise} style={{ marginLeft: "0.5rem" }}>
              Create Exercise
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExerciseCreator;
