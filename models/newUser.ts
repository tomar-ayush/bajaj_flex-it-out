import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  score: {
    type: Number
  }
},
  {
    collection: "bajaj_users_new",
    timestamps: true,
  }
);


export const User = mongoose.models.User || mongoose.model("User", userSchema) 
