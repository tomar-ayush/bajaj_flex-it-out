import { NextRequest, NextResponse } from 'next/server';
import connectDB from "@/utils/db";
import { User } from "@/models/user";

export async function PUT(request: NextRequest) {
	try {
		await connectDB();

		const body = await request.json();
		const { email, calories, tokens } = body;

		if (!email || calories === undefined || tokens === undefined) {
			return NextResponse.json(
				{ message: 'Missing required fields' },
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

		user.calories += calories;
		user.points += calories / 5;
		user.token += tokens;
		await user.save();

		return NextResponse.json(
			{ message: 'User updated successfully' },
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error updating user', error);
		return NextResponse.json(
			{ message: 'Internal server error' },
			{ status: 500 }
		);
	}
}
