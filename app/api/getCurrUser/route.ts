import connectDB from "@/utils/db";
import { User } from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import { IUserLean } from "@/types/user";


export async function GET(request: NextRequest) {
	try {
		await connectDB();

		// Get user email from query parameter
		const searchParams = request.nextUrl.searchParams;
		const email = searchParams.get('email');

		if (!email) {
			return NextResponse.json(
				{
					success: false,
					message: "Email parameter is required"
				},
				{ status: 400 }
			);
		}

		// Find the user and their points
		const user = await User.findOne({ email }).lean() as IUserLean;

		if (!user) {
			return NextResponse.json(
				{
					success: false,
					message: "User not found"
				},
				{ status: 404 }
			);
		}

		// Count how many users have more points than this user
		const higherRankedUsers = await User.countDocuments({
			points: { $gt: user.points }
		});

		// The rank is the number of users with more points + 1
		const rank = higherRankedUsers + 1;

		// Get total number of users for percentile calculation
		const totalUsers = await User.countDocuments();

		// Calculate percentile (lower is better)
		const percentile = ((rank / totalUsers) * 100).toFixed(1);

		return NextResponse.json(
			{
				success: true,
				data: {
					user: {
						name: user.name,
						points: user.points || 0,
					},
					rank,
					totalUsers,
					percentile: `${percentile}%`,
				}
			},
			{ status: 200 }
		);

	} catch (error) {
		console.error('Error fetching user rank:', error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to fetch user rank",
				error: error instanceof Error ? error.message : "Unknown error occurred"
			},
			{ status: 500 }
		);
	}
}
