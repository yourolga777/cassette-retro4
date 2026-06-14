import { db } from "@/lib/db";
import { products, posts } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

async function downloadImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const ext = path.extname(new URL(url).pathname) || ".jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    if (!existsSync(UPLOAD_DIR)) await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, fileName), buffer);
    return `/api/uploads/${fileName}`;
  } catch {
    return null;
  }
}

async function main() {
  console.log("Migrating product images...");
  const allProducts = await db.select().from(products);
  for (const p of allProducts) {
    if (!p.imageUrl) continue;
    if (p.imageUrl.startsWith("/api/uploads/")) continue;
    console.log(`  ${p.name}: ${p.imageUrl}`);
    const localUrl = await downloadImage(p.imageUrl);
    if (localUrl) {
      await db.update(products).set({ imageUrl: localUrl }).where(eq(products.id, p.id));
      console.log(`    -> ${localUrl}`);
    } else {
      console.log(`    FAILED`);
    }
  }

  console.log("Migrating post covers...");
  const allPosts = await db.select().from(posts);
  for (const p of allPosts) {
    if (!p.coverUrl) continue;
    if (p.coverUrl.startsWith("/api/uploads/")) continue;
    console.log(`  ${p.title}: ${p.coverUrl}`);
    const localUrl = await downloadImage(p.coverUrl);
    if (localUrl) {
      await db.update(posts).set({ coverUrl: localUrl }).where(eq(posts.id, p.id));
      console.log(`    -> ${localUrl}`);
    } else {
      console.log(`    FAILED`);
    }
  }

  console.log("Done!");
}

main().catch(console.error);
