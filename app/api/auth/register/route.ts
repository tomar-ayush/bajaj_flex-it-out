import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/utils/db";
import { User } from "@/models/user";

const checkOtp = async (otp: string, email: string) => {

	console.log("otp called")

	try {

		const response = await fetch('http://localhost:3000/api/auth/verify-otp', { method: "POST", body: JSON.stringify({ otp, email }) });

		const data = await response.json();

		return data.valid;
	} catch (error) {
		console.error(error);
		return false;
	}

}



export async function POST(req: Request) {
	await connectDB();




	try {
		const { name, email, password, otp } = await req.json();

		//check for valid entries

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return NextResponse.json({ error: "User already exists" }, { status: 400 });
		}

		//check if the otp matches
		const isOtpCorrect = await checkOtp(otp, email);
		if (!isOtpCorrect) {
			return NextResponse.json({ error: "Invalid OTP" }, { status: 401, headers: { 'Content-Type': 'application/json' } });
		}

		console.log("otp verified")
		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create the user
		try {
			await User.create({ name, email, password: hashedPassword })
		} catch (err) {
			console.log("error while creting user" + err);
		}

		console.log("user created")


		return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
	} catch (error) {
		return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
	}
}
