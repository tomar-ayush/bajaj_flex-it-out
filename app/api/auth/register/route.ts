import { User } from "@/models/user";
import connectDB from "@/utils/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const checkOtp = async (otp: string, email: string) => {

  try {
    const response = await fetch(`${process.env.PORT}/api/auth/verify-otp`, {
      method: "POST",
      body: JSON.stringify({ otp, email }),
    });

    const data = await response.json();

    return data.valid;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export async function POST(req: Request) {
  await connectDB();

  try {
    const { name, email, password, otp } = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const isOtpCorrect = await checkOtp(otp, email);
    if (!isOtpCorrect) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await User.create({ name, email, password: hashedPassword });
    } catch (err) {
      console.log("error while creting user" + err);
    }

    console.log("user created");

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
