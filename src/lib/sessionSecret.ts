const rawSecret = process.env.SESSION_SECRET;
if (!rawSecret || rawSecret.length < 32) {
  throw new Error(
    "SESSION_SECRET env var is missing or must be at least 32 characters (generate one with `openssl rand -base64 32`)",
  );
}

export const sessionSecret: string = rawSecret;
