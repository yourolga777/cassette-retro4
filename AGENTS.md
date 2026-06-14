<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:drizzle-migrations -->
# Drizzle Migrations Workflow

## NEVER use `drizzle-kit push` on production — it can drop and recreate tables, deleting all data.

## Safe workflow for schema changes:
1. Edit `src/lib/schema.ts`
2. Run `npm run db:generate` — creates migration files in `src/drizzle/`
3. Run `npm run db:migrate` — applies pending migrations to the database
4. Commit both the schema changes AND the generated migration files

## Seed data:
- Run `npm run db:seed` to populate products and posts

## Init (one-time):
- `init-migration-tracking.ts` was used to create the `drizzle.__drizzle_migrations` tracking table
<!-- END:drizzle-migrations -->
