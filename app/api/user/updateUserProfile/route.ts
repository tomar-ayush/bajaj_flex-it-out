import connectDB from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/user";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
	try {
		await connectDB();

		const body = await req.json();
		const { name, email, curr_password, new_password } = body;

		if (!email || !curr_password) {
			return NextResponse.json(
				{ message: "Missing required fields" },
				{ status: 400 }
			);
		}

		const user = await User.findOne({ email });

		if (!user) {
			return NextResponse.json(
				{ message: 'User not found' },
				{ status: 404 }
			);
		}

		const isValid = await bcrypt.compare(curr_password, user.password);

		if (!isValid) {
			return NextResponse.json(
				{ message: "Incorrect current password" },
				{ status: 400 }
			);
		}


		if (name !== undefined) {
			user.name = name;
		}

		if (new_password !== undefined && new_password !== "") {
			const hashedNewPassword = await bcrypt.hash(new_password, 10);
			user.password = hashedNewPassword;
		}

		await user.save();

		return NextResponse.json(
			{ message: "User updated successfully" },
			{ status: 200 }
		);

	} catch (error) {
		console.error("Error while updating user:", error);
		return NextResponse.json(
			{ message: `Error while updating user: ${error}` },
			{ status: 500 }
		);
	}
}
