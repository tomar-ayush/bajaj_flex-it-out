import mongoose from 'mongoose';

const mongo_uri = process.env.MONGO_URI;

if (!mongo_uri) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}

interface MongooseGlobal {
  mongoose: {
    conn: any;
    promise: any;
  };
}

declare const global: MongooseGlobal;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'Practice',
    };

    cached.promise = mongoose.connect(mongo_uri as string, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
