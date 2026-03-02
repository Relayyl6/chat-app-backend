import { config } from 'dotenv';

config({ path: `.env.local` });

export const {
    PORT,
    NODE_ENV,
    MONGODB_URI,
    REDIS_URL,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    ALLOWED_ORIGINS
} = process.env