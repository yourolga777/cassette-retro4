CREATE TABLE "bot_sessions" (
	"chat_id" text PRIMARY KEY NOT NULL,
	"step" text,
	"data" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
