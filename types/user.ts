export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  points?: number;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

// Type for lean queries (plain JavaScript objects)
export interface IUserLean {
  _id: string;
  name: string;
  email: string;
  points?: number; // Make points optional since it might not always be set
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
