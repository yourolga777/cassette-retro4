ALTER TABLE "orders" ADD COLUMN "payment_method" text DEFAULT 'card' NOT NULL;
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "receipt_url" text;
