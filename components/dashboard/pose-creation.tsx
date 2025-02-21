"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import * as posedetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs";
import { toast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import { Card } from "@/components/ui/card";

export default function PoseCreation() {
  const [detector, setDetector] = useState<posedetection.PoseDetector | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [poseData, setPoseData] = useState<posedetection.Pose | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize the pose detector.
  useEffect(() => {
    async function initDetector() {
      await tf.ready();
      const detectorConfig = { modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
      const detectorInstance = await posedetection.createDetector(
        posedetection.SupportedModels.MoveNet,
        detectorConfig
      );
      setDetector(detectorInstance);
    }
    initDetector();
  }, []);

  // Handle image upload.
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setImageURL(url);
      setPoseData(null);
    }
  };

  // Run pose detection on the loaded image.
  const detectPoseFromImage = useCallback(async () => {
    if (!detector || !imageRef.current) return;
    try {
      const poses = await detector.estimatePoses(imageRef.current);
      if (poses && poses.length > 0) {
        setPoseData(poses[0]);
        toast({ title: "Pose detected successfully!", variant: "success" });
      } else {
        toast({ title: "No pose detected.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Pose detection error:", error);
      toast({ title: "Error detecting pose.", variant: "destructive" });
    }
  }, [detector]);

  // Draw the image, pose keypoints and skeleton on the canvas.
  const drawPose = useCallback(() => {
    if (!canvasRef.current || !imageRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Clear previous drawings.
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw image.
    ctx.drawImage(imageRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

    // If pose data exists, draw keypoints and skeleton.
    if (poseData) {
      // Draw keypoints.
      poseData.keypoints.forEach((kp) => {
        if (kp.score && kp.score > 0.5 && kp.x >= 0 && kp.y >= 0) {
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = "red";
          ctx.fill();
        }
      });
      // Draw skeleton.
      const adjacentPairs = posedetection.util.getAdjacentPairs(posedetection.SupportedModels.MoveNet);
      adjacentPairs.forEach(([i, j]) => {
        const kp1 = poseData.keypoints[i];
        const kp2 = poseData.keypoints[j];
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
    }
  }, [poseData]);

  // Redraw the canvas whenever the image or pose data updates.
  useEffect(() => {
    if (imageURL) {
      const image = new Image();
      image.src = imageURL;
      image.onload = () => {
        if (canvasRef.current) {
          canvasRef.current.width = image.width;
          canvasRef.current.height = image.height;
        }
        if (imageRef.current) {
          imageRef.current.src = imageURL;
        }
        drawPose();
      };
    }
  }, [imageURL, drawPose]);

  // Redraw when poseData change.
  useEffect(() => {
    if (imageURL) {
      drawPose();
    }
  }, [poseData, imageURL, drawPose]);

  // Save pose action; implement saving logic as needed.
  const handleSavePose = () => {
    if (poseData) {
      // Here you could send poseData to your API or store it.
      console.log("Pose data to be saved:", poseData);
      toast({ title: "Pose saved!", variant: "success" });
    } else {
      toast({ title: "No pose detected to save.", variant: "destructive" });
    }
  };

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Create New Pose from Image</h2>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>
      {imageURL && (
        <div className="mb-4">
          <div className="relative">
            <canvas ref={canvasRef} className="w-full h-auto" />
            <img ref={imageRef} style={{ display: "none" }} alt="Uploaded" />
          </div>
          <div className="mt-2 flex gap-2">
            <Button onClick={detectPoseFromImage}>Detect Pose</Button>
            <Button onClick={handleSavePose}>Save Pose</Button>
          </div>
        </div>
      )}
      {!imageURL && (
        <p className="text-muted-foreground">Upload an image to create a new pose.</p>
      )}
    </Card>
  );
}
