import { readdirSync } from "fs";
import path from "path";

export async function GET() {
  const dir = path.join(process.cwd(), "src/generated/prisma");
  let files: string[] = [];
  let error: string | null = null;
  try {
    files = readdirSync(dir);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  return Response.json({ cwd: process.cwd(), dir, files, error });
}
