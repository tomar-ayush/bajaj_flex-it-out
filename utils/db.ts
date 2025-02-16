import mongoose from 'mongoose';

// Ensure the MONGO_URI environment variable is defined
const mongo_uri:any = process.env.MONGO_URI;
if (!mongo_uri) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}

declare global {
  var mongooseCache: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

// Initialize mongooseCache if it doesn't exist
globalThis.mongooseCache = globalThis.mongooseCache || { conn: null, promise: null };

async function connectDB() {
  // If a connection is already established, return it
  if (globalThis.mongooseCache.conn) {
    return globalThis.mongooseCache.conn;
  }

  // If a connection promise doesn't exist, create one
  if (!globalThis.mongooseCache.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'Practice',
    };

    globalThis.mongooseCache.promise = mongoose.connect(mongo_uri, opts)
      .then((mongoose) => mongoose.connection)
      .catch((err) => {
        console.error("MongoDB Connection Error:", err);
        throw new Error("MongoDB connection failed");
      });
  }

  // Await the promise to establish the connection
  globalThis.mongooseCache.conn = await globalThis.mongooseCache.promise;
  return globalThis.mongooseCache.conn;
}

export default connectDB;
