import { getConfig } from "./config";

export function getDbOptions() {
  const { env, mongodbDbName } = getConfig();
  if (env === "production" || env === "staging") {
    return {
      dbName: mongodbDbName,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 50,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
    };
  }
  if (env === "test") {
    return {
      dbName: mongodbDbName,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 5,
    };
  }
  return {
    dbName: mongodbDbName,
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
  };
}
