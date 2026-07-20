"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, expectedAuthToken, isValidPassword } from "@/lib/auth";

export async function login(
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!isValidPassword(password)) {
    return { error: "Incorrect password" };
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, expectedAuthToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect(next.startsWith("/") ? next : "/");
}
