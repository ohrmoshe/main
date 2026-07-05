import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core"

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  addressLine1: text("address_line1"),
  addressCity: text("address_city"),
  addressState: text("address_state"),
  addressPostalCode: text("address_postal_code"),
  addressCountry: text("address_country"),
  entries: integer("entries").notNull(),
  // Promo bonus entries that count toward ONLY one specific drawing (bonusEntriesUntil).
  // After that drawing passes, the bonus expires and the donor reverts to base `entries`.
  bonusEntries: integer("bonus_entries").notNull().default(0),
  bonusEntriesUntil: timestamp("bonus_entries_until"),
  amountCents: integer("amount_cents").notNull(),
  status: text("status").notNull().default("active"),
  emailConsent: boolean("email_consent").default(false),
  smsConsent: boolean("sms_consent").default(false),
  referralCode: text("referral_code"),
  createdAt: timestamp("created_at").defaultNow(),
  cancelledAt: timestamp("cancelled_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const affiliates = pgTable("affiliates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  code: text("code").notNull().unique(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
})

export const wheelNumbers = pgTable("wheel_numbers", {
  number: integer("number").primaryKey(),
  donorName: text("donor_name"),
  donorEmail: text("donor_email"),
  donorPhone: text("donor_phone"),
  amountCents: integer("amount_cents").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  referralCode: text("referral_code"),
  createdAt: timestamp("created_at").defaultNow(),
})
