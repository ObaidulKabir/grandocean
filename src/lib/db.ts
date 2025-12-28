import mongoose from "mongoose";
import { getConfig } from "./config";
import { getDbOptions } from "./dbOptions";

const { mongodbUri, mongodbDbName } = getConfig();

if (!process.env.MONGODB_URI) {
  console.warn("MONGODB_URI is not set. Falling back to local MongoDB at mongodb://localhost:27017/unitech_grand_ocean");
}

interface GlobalWithMongoose {
  mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

declare const global: GlobalWithMongoose & typeof globalThis;

const cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongodbUri, getDbOptions())
      .catch(async (err) => {
        const env = (process.env.APP_ENV || process.env.NODE_ENV || "development").toLowerCase();
        console.warn(`Primary DB connection failed: ${err?.message || err}`);
        if (env === "development" || env === "test") {
          const fallbackUri = "mongodb://localhost:27017/unitech_grand_ocean";
          console.warn(`Attempting local fallback: ${fallbackUri}`);
          try {
            return await mongoose.connect(fallbackUri, getDbOptions());
          } catch (localErr) {
            console.warn(`Local fallback failed: ${localErr?.message || localErr}`);
            try {
              const { MongoMemoryServer } = await import("mongodb-memory-server");
              const mongod = await MongoMemoryServer.create();
              const memUri = mongod.getUri("unitech_grand_ocean");
              console.warn(`Using in-memory MongoDB: ${memUri}`);
              return await mongoose.connect(memUri, getDbOptions());
            } catch (memErr) {
              console.warn(`In-memory fallback failed: ${memErr?.message || memErr}`);
            }
          }
        }
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
