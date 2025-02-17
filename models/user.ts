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
  accounts?: mongoose.Types.ObjectId[];
  sessions?: mongoose.Types.ObjectId[];
}

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
  image: String,
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

  accounts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  }],
  sessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }]
}, {
  collection: "bajaj_users", // Custom collection name
  timestamps: true
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
