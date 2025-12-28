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
        const errMsg = err instanceof Error ? err.message : String(err);
        console.warn(`Primary DB connection failed: ${errMsg}`);
        if (env === "development" || env === "test") {
          const fallbackUri = "mongodb://localhost:27017/unitech_grand_ocean";
          console.warn(`Attempting local fallback: ${fallbackUri}`);
          try {
            return await mongoose.connect(fallbackUri, getDbOptions());
          } catch (localErr) {
            const errMsg = localErr instanceof Error ? localErr.message : String(localErr);
            console.warn(`Local fallback failed: ${errMsg}`);
            try {
              const { MongoMemoryServer } = await import("mongodb-memory-server");
              const mongod = await MongoMemoryServer.create();
              const memUri = mongod.getUri("unitech_grand_ocean");
              console.warn(`Using in-memory MongoDB: ${memUri}`);
              return await mongoose.connect(memUri, getDbOptions());
            } catch (memErr) {
              const memErrMsg = memErr instanceof Error ? memErr.message : String(memErr);
              console.warn(`In-memory fallback failed: ${memErrMsg}`);
            }
          }
        }
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
