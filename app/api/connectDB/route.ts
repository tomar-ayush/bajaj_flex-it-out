import connectDB from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(request: NextRequest) {
	
	await connectDB();

	return NextResponse.json({ message: "The db is connected" });


}
