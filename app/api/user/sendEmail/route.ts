import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/utils/db";

export async function POST(req: NextRequest) {
	const { email, body } = await req.json();
	await connectDB();

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
		subject: "Purchase Successful!",
		text: body,
	});

	return NextResponse.json({ message: "OTP sent successfully" });
}

