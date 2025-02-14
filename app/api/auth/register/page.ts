import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/utils/db";
import { User } from "@/models/user";

export async function POST(req: Request) {
	await connectDB();
	try {
		const { name, email, password } = await req.json();

		//check for valid entries

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return NextResponse.json({ error: "User already exists" }, { status: 400 });
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create the user
		try {
			User.create({ name, email, hashedPassword })
		} catch (err) {
			console.log("error while creting user" + err);
		}


		return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
	} catch (error) {
		return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
	}
}
