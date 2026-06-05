"use server"

import { stripe } from "@/lib/stripe"
import { db } from "@/lib/db"
import { donations } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function lookupSubscription(email: string) {
  // Find donor by email
  const [donor] = await db
    .select()
    .from(donations)
    .where(eq(donations.email, email))

  if (!donor || donor.status === "cancelled") {
    return { found: false, message: "No active subscription found for this email." }
  }

  return {
    found: true,
    donor: {
      name: donor.name,
      email: donor.email,
      entries: donor.entries,
      amount: donor.amountCents / 100,
      subscriptionId: donor.stripeSubscriptionId,
    },
  }
}

export async function cancelSubscription(email: string) {
  // Find donor by email
  const [donor] = await db
    .select()
    .from(donations)
    .where(eq(donations.email, email))

  if (!donor || !donor.stripeSubscriptionId) {
    return { success: false, message: "No active subscription found." }
  }

  try {
    // Cancel in Stripe
    await stripe.subscriptions.cancel(donor.stripeSubscriptionId)

    // Update database
    await db
      .update(donations)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(donations.id, donor.id))

    return { success: true }
  } catch (error) {
    console.error("Cancel subscription error:", error)
    return { success: false, message: "Failed to cancel subscription. Please try again." }
  }
}
