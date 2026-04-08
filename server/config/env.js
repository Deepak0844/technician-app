import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../env/.env"), quiet: true });
// Fallback to .env in server root
dotenv.config({ path: path.resolve(__dirname, "../.env"), quiet: true });

/**
 * Environment Variable Schema
 */
const envSchema = z.object({
  PORT: z.string().default("3000"),
  MONGODB_URI: z.string({ required_error: "MONGODB_URI is required" }),
  JWT_SECRET: z.string({ required_error: "JWT_SECRET is required" }),
  JWT_EXPIRES_IN: z.string().default("7d"),
  TWOFACTOR_API_KEY: z.string({ required_error: "TWOFACTOR_API_KEY is required" }),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  ALLOWED_ORIGINS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

const Env = parsed.data;

export default Env;
