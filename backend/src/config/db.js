import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(env.mongoUri);
    console.log("[db] MongoDB connected");
  } catch (error) {
    const fallbackUri = env.mongoUri.includes("localhost")
      ? env.mongoUri.replace("localhost", "127.0.0.1")
      : null;

    if (fallbackUri && error?.name === "MongooseServerSelectionError") {
      console.warn("[db] Retrying MongoDB connection with 127.0.0.1");
      await mongoose.connect(fallbackUri);
      console.log("[db] MongoDB connected using fallback host");
      return;
    }

    throw error;
  }
}
