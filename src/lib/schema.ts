import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  price: integer("price").notNull(),
  category: text("category").notNull().$type<"blank" | "recorded" | "equipment">(),
  brand: text("brand"),
  typeLabel: text("type_label"),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  stockCount: integer("stock_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  type: text("type").notNull().$type<"original" | "saved">(),
  content: text("content"),
  sourceUrl: text("source_url"),
  summary: text("summary"),
  coverUrl: text("cover_url"),
  tags: text("tags").array(),
  published: boolean("published").default(false),
  telegramMessageId: integer("telegram_message_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  phone: text("phone"),
  address: text("address"),
  telegramId: text("telegram_id"),
  emailSubscribed: boolean("email_subscribed").default(true),
  telegramSubscribed: boolean("telegram_subscribed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").unique().notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  comment: text("comment"),
  totalAmount: integer("total_amount").notNull(),
  status: text("status").notNull().default("pending").$type<"pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded" | "failed">(),
  items: jsonb("items").notNull(),
  paymentMethod: text("payment_method").notNull().default("card").$type<"card" | "cash">(),
  paymentUrl: text("payment_url"),
  tinkoffPaymentId: text("tinkoff_payment_id"),
  receiptUrl: text("receipt_url"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dailyStats = pgTable("daily_stats", {
  id: serial("id").primaryKey(),
  date: text("date").unique().notNull(),
  soldCount: integer("sold_count").default(0),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  rating: integer("rating").notNull(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  status: text("status").notNull().default("pending").$type<"pending" | "approved" | "rejected">(),
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviewLikes = pgTable("review_likes", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id")
    .notNull()
    .references(() => reviews.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviewReports = pgTable("review_reports", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id")
    .notNull()
    .references(() => reviews.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  query: text("query").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const botConfig = pgTable("bot_config", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
