import { NextResponse } from "next/server";
import Otp from "../../../../models/otpModel";

export async function POST(req: Response) {
	const { email, otp } = await req.json();

	// Fetch the latest OTP from the database for the given email
	const storedOtp = await Otp.find({ email }).sort({ createdAt: -1 }).limit(1);

	// If no OTP is found or OTP has expired
	if (!storedOtp) {
		return NextResponse.json(
			{ error: "OTP expired or invalid", valid: false },
			{ status: 400 }
		);
	}

	// Compare the OTP with the one sent
	if (storedOtp[0].otp !== otp) {
		return NextResponse.json({ error: "Incorrect OTP", valid: false }, { status: 400 });
	}

	return NextResponse.json(
		{ message: "OTP verified successfully", valid: true },
		{ status: 200 }
	);
}

