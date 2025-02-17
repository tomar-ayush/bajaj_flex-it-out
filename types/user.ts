import { Document, Types } from 'mongoose';

// Interface for Mongoose Document (used in model)
export interface IUser extends Document {
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  points: number;
  accounts?: Types.ObjectId[];
  sessions?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Interface for lean queries (plain JavaScript objects)
export interface IUserLean {
  _id: string;
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  points: number;
  accounts?: string[]; // ObjectId becomes string in lean queries
  sessions?: string[]; // ObjectId becomes string in lean queries
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

// Interface for API response
export interface IUserResponse {
  success: boolean;
  data?: {
    user: {
      name?: string;
      points: number;
    };
    rank: number;
    totalUsers: number;
    percentile: string;
  };
  message?: string;
  error?: string;
}
