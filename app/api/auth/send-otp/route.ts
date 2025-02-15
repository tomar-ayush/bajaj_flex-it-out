import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import Otp from "@/models/otpModel";
import connectDB from "@/utils/db";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await connectDB();

  const otp_obj = new Otp({ email, otp, createdAt: Date.now() });
  await otp_obj.save();

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT!, 10),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Send the OTP email
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP",
    text: `Your OTP is ${otp}`,
  });

  return NextResponse.json({ message: "OTP sent successfully" });
}
