import { spawn } from "child_process";

const run = (cmd, args) =>
  new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: "inherit", shell: true });
    proc.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`exit code ${code}`))
    );
    proc.on("error", reject);
  });

async function main() {
  console.log("\n=== 1/3 Migrations ===");
  await run("npx", ["tsx", "migrate.ts"]);

  console.log("\n=== 2/3 Seed (if empty) ===");
  try {
    await run("npx", ["tsx", "scripts/seed-if-empty.ts"]);
  } catch {
    console.log("Seed skipped or already seeded");
  }

  console.log("\n=== 3/3 Starting server ===");
  await run("npm", ["run", "start"]);
}

main().catch((err) => {
  console.error("Startup failed:", err);
  process.exit(1);
});
