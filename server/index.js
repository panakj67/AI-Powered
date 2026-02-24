import dotenv from "dotenv";
dotenv.config();
import connectDb from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { bootstrapReminderScheduler } from "./services/reminder.service.js";
import { createApp } from "./app.js";

const app = createApp();
const port = process.env.PORT || 3000;

connectDb();
connectRedis().catch((error) => {
  console.error("[redis] connection bootstrap failed", error?.message || error);
});

app.listen(port, async () => {
  await bootstrapReminderScheduler();
  console.log(`Server is running on PORT ${port} !!`);
});
