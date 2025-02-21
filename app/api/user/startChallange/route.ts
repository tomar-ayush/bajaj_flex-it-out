import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import { User, IUserChallenge } from '@/models/user';

export async function POST(req: NextRequest) {
	await connectDB();

	let body;
	try {
		body = await req.json();
	} catch (error) {
		return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
	}

	const { challengeId, email } = body;

	if (!email || !challengeId) {
		return NextResponse.json({ message: 'Missing email or challengeId' }, { status: 400 });
	}

	try {
		const user = await User.findOne({ email });
		if (!user) {
			return NextResponse.json({ message: 'User not found' }, { status: 400 });
		}

		if (!user.challenges) {
			user.challenges = [];
		}

		const existingChallenge = user.challenges.find(
			(ch: IUserChallenge) => ch.challengeId === challengeId
		);
		if (existingChallenge) {
			return NextResponse.json(
				{
					message: 'Challenge already started',
					status: 'existing',
					challenges: user.challenges,
				},
				{ status: 200 }
			);
		}

		console.log("db saving started")

		const newChallenge: IUserChallenge = {
			challengeId,
			startedAt: new Date(),
			progress: 0
		};

		user.challenges.push(newChallenge);

		console.log(await user.challenges)

		await user.save();

		return NextResponse.json(
			{
				message: 'Challenge started successfully',
				challenge: { challengeId, startedAt: new Date(), progress: 0 },
			},
			{ status: 200 }
		);
	} catch (error: any) {
		return NextResponse.json(
			{ message: 'Server error', error: error.message },
			{ status: 400 }
		);
	}
}
