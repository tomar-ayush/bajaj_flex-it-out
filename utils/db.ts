import mongoose from "mongoose";

const mongo_uri = process.env.MONGO_URI

const connectDB = async () => {
  const connection = await mongoose.connection.readyState;

  if (connection === 1) {
    // Already connected
    return;
  }

  if (connection === 2) {
    // Connecting
    return;
  }

  try {
    await mongoose.connect(mongo_uri!, {
      dbName: "Practice",
      bufferCommands: true,
    });


    console.log("MongoDB connected");
  }
  catch (err) {
    console.error(err);
    throw new Error("MongoDB connection failed");
  }

}

export default connectDB;
