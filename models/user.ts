import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
  name?: string;
  email: string;
  password: string;
  emailVerified?: Date;
  image?: string;
  points: number;
  token: number;
  calories: number;
  challanges: IUserChallenge[];
  accounts?: mongoose.Types.ObjectId[];
  sessions?: mongoose.Types.ObjectId[];
}


export interface IUserChallenge {
  challengeId: string;
  startedAt: Date;
  completedAt?: Date;
  progress: number;
}


const userChallengeSchema = new mongoose.Schema<IUserChallenge>({
  challengeId: { type: String, required: true },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  progress: { type: Number, default: 0 },
});


const userSchema = new mongoose.Schema<IUser>({
  name: String,
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  emailVerified: Date,

  image: {
    type: String,
    default: "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?t=st=1739812418~exp=1739816018~hmac=2442be3cd30435c77e5ab68924abe83003c70c93db0a9ef781b4625d57154d82&w=740",
  },
  points: {
    type: Number,
    default: 0,
  },
  calories: {
    type: Number,
    default: 0,
  },
  token: {
    type: Number,
    default: 0,
  },
  challanges: [userChallengeSchema],
  accounts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  }],
  sessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }]
}, {
  collection: "bajaj_users",
  timestamps: true
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
