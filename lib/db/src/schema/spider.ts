import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const spiderPairs = pgTable("spider_pairs", {
  id: uuid("id").defaultRandom().primaryKey(),
  pairCode: text("pair_code").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const spiderDevices = pgTable("spider_devices", {
  id: uuid("id").defaultRandom().primaryKey(),
  pairId: uuid("pair_id").notNull().references(() => spiderPairs.id, { onDelete: "cascade" }),
  pushToken: text("push_token").notNull().unique(),
  label: text("label").notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
});

export const spiderCalls = pgTable("spider_calls", {
  id: uuid("id").defaultRandom().primaryKey(),
  pairId: uuid("pair_id").notNull().references(() => spiderPairs.id, { onDelete: "cascade" }),
  senderDeviceId: uuid("sender_device_id").notNull().references(() => spiderDevices.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }),
  priority: integer("priority").notNull().default(10),
});