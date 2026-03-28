import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

async function bootstrap() {
  try {
    await connectDatabase();
    app.listen(env.port, () => {
      console.log(`[server] NeuroNews backend running on port ${env.port}`);
    });
  } catch (error) {
    console.error("[server] Startup failed", error);
    process.exit(1);
  }
}

bootstrap();
