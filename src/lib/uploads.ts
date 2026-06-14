import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export function getUploadDir(): string {
  return path.join(process.cwd(), "public", "uploads");
}

export async function saveImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name) || ".jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
  const dir = getUploadDir();
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), buffer);
  return `/api/uploads/${fileName}`;
}
