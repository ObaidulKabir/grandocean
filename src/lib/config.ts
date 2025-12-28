export type AppConfig = {
  env: "development" | "test" | "staging" | "production";
  mongodbUri: string;
  mongodbDbName: string;
};

function resolveEnv(): AppConfig["env"] {
  const appEnv = (process.env.APP_ENV || "").toLowerCase();
  if (appEnv === "staging") return "staging";
  if (appEnv === "production") return "production";
  if (appEnv === "test") return "test";
  const nodeEnv = (process.env.NODE_ENV || "").toLowerCase();
  if (nodeEnv === "test") return "test";
  if (nodeEnv === "production") {
    if (process.env.STAGING === "true") return "staging";
    return "production";
  }
  return "development";
}

export function getConfig(): AppConfig {
  const env = resolveEnv();
  const upper = env.toUpperCase();
  const uri =
    process.env.MONGODB_URI ||
    process.env[`MONGODB_URI_${upper}`] ||
    "mongodb://localhost:27017/unitech_grand_ocean";
  const dbName =
    process.env.MONGODB_DB_NAME ||
    process.env[`MONGODB_DB_NAME_${upper}`] ||
    "unitech_grand_ocean";
  return { env, mongodbUri: uri, mongodbDbName: dbName };
}
