import { NextResponse } from "next/server";
import Otp from "../../../../models/otpModel";

export async function POST(req: Response) {
	const { email, otp } = await req.json();

	const storedOtp = await Otp.find({ email }).sort({ createdAt: -1 }).limit(1);

	if (!storedOtp) {
		return NextResponse.json(
			{ error: "OTP expired or invalid", valid: false },
			{ status: 400 }
		);
	}

	if (storedOtp[0].otp !== otp) {
		return NextResponse.json({ error: "Incorrect OTP", valid: false }, { status: 400 });
	}

	return NextResponse.json(
		{ message: "OTP verified successfully", valid: true },
		{ status: 200 }
	);
}

