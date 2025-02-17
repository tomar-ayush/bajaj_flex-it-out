import connectDB from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/user";

export async function PUT(request: NextRequest) {
	try {
		await connectDB();

		const body = await request.json();
		const { email, tokens } = body;

		// Validate inputs
		if (!email || tokens === undefined) {
			return NextResponse.json(
				{ message: 'Missing required fields' },
				{ status: 400 }
			);
		}

		// Convert tokens to integer and validate
		const tokenAmount = parseInt(tokens);
		if (isNaN(tokenAmount) || tokenAmount <= 0) {
			return NextResponse.json(
				{ message: 'Invalid tokens value - must be a positive integer' },
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

		// Initialize and ensure token is an integer
		const currentTokens = user.token || 0;

		// Check if user has enough tokens
		if (currentTokens < tokenAmount) {
			return NextResponse.json(
				{ message: 'Insufficient tokens' },
				{ status: 400 }
			);
		}

		console.log("tokens before update:", currentTokens);
		user.token = currentTokens - tokenAmount;
		console.log("tokens after update:", user.token);

		await user.save();

		return NextResponse.json(
			{
				message: 'User updated successfully',
				remainingTokens: user.token
			},
			{ status: 200 }
		);

	} catch (error) {
		console.error('Error updating user:', error);
		return NextResponse.json(
			{ message: 'Internal server error' },
			{ status: 500 }
		);
	}
}
