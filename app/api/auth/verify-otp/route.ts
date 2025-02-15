import Otp from "@/models/otpModel";
import connectDB from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, otp } = await req.json();

    const storedOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });

    if (!storedOtp) {
      return NextResponse.json(
        { error: "OTP expired or invalid", valid: false },
        { status: 400 }
      );
    }

    if (storedOtp.expiresAt < Date.now()) {
      return NextResponse.json(
        { error: "OTP has expired", valid: false },
        { status: 400 }
      );
    }

    if (storedOtp.otp !== otp) {
      return NextResponse.json(
        { error: "Incorrect OTP", valid: false },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "OTP verified successfully", valid: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Internal Server Error", valid: false },
      { status: 500 }
    );
  }
}
