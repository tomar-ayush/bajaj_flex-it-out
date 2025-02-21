import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/utils/db';
import { User } from '@/models/user';

export async function POST(req: NextApiRequest, res: NextApiResponse) {

	await connectDB();

	const { userId, challengeId, email } = req.body;

	if (!email || !challengeId) {
		return res.status(400).json({ message: 'Missing userId or challengeId' });
	}

	try {
		const user = await User.findOne({ email: email });
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const existingChallenge = user.challenges.find(
			(ch) => ch.challengeId === challengeId
		);
		if (existingChallenge) {
			return res.status(200).json({ message: 'Challenge already started', status: "existing", challange: user.challenge });
		}

		user.challenges.push({
			challengeId,
			startedAt: new Date(),
			progress: 0,
		});

		await user.save();

		return res
			.status(200)
			.json({ message: 'Challenge started successfully', challenge: { challengeId, startedAt: new Date(), progress: 0 } });
	} catch (error: any) {
		return res.status(500).json({ message: 'Server error', error: error.message });
	}
}
