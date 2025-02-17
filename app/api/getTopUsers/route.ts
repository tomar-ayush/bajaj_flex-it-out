import connectDB from "@/utils/db";
import { User } from "@/models/user"
import { NextRequest, NextResponse } from "next/server";
import { image } from "@tensorflow/tfjs";


export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {

	try {



		await connectDB();
		{/* const allUsers = await User.find({}) */ }
		const topUsers = await User.find({})
			.select('-password') // Exclude password from the response
			.sort({ points: -1 }) // Sort by points in descending order
			.limit(5) // Get only 3 users
			.lean();
		// console.log(allUsers)
		// return NextResponse.json({ message: "The db is connected", user: "users" });


		return NextResponse.json(
			{
				success: true,
				message: "Top users fetched successfully",
				users: topUsers.map(user => ({
					name: user.name,
					// email: user.email,
					points: user.points || 0,
					createdAt: user.createdAt,
					image: user.image,
				})),
				count: topUsers.length
			},
			{ status: 200 }
		);

	} catch (error) {
		console.error('Error fetching top users:', error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to fetch top users",
				error: error instanceof Error ? error.message : "Unknown error occurred"
			},
			{ status: 500 }
		);
	}
}
