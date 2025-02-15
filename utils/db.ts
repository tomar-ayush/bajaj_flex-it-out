import mongoose from 'mongoose';

const mongo_uri:any = process.env.MONGO_URI;

if (!mongo_uri) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Augment the global object to include mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache;
}

// Initialize the cache if it doesn't exist
global.mongooseCache = global.mongooseCache || { conn: null, promise: null };

async function connectDB() {
  if (global.mongooseCache.conn) {
    return global.mongooseCache.conn;
  }

  if (!global.mongooseCache.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'Practice',
    };

    global.mongooseCache.promise = mongoose.connect(mongo_uri, opts).then((mongoose) => mongoose);
  }
  global.mongooseCache.conn = await global.mongooseCache.promise;
  return global.mongooseCache.conn;
}

export default connectDB;
