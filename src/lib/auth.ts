import { createHmac } from "crypto";

export const AUTH_COOKIE = "auth";

export function expectedAuthToken(): string {
  const password = process.env.APP_PASSWORD;
  if (!password) throw new Error("APP_PASSWORD is not set");
  return createHmac("sha256", password).update("authenticated").digest("hex");
}

export function isValidPassword(password: string): boolean {
  return password === process.env.APP_PASSWORD;
}
