import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  points: {
    type: Number
  }

},
  {
    collection: "bajaj_users", // Custom collection name
    timestamps: true,
  }
);


export const User = mongoose.models.User || mongoose.model("User", userSchema) 
