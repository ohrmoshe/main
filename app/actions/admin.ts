"use server"

import { db } from "@/lib/db"
import { donations } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"

type DonationFilter = "all" | "active" | "cancelled" | "one_time"

export async function getDonations(filter: DonationFilter = "all") {
  if (filter === "active" || filter === "cancelled" || filter === "one_time") {
    const results = await db
      .select()
      .from(donations)
      .where(eq(donations.status, filter))
      .orderBy(desc(donations.createdAt))
    return results
  }

  return db.select().from(donations).orderBy(desc(donations.createdAt))
}

export async function getDonationStats() {
  const allDonations = await db.select().from(donations)

  const active = allDonations.filter((d) => d.status === "active")
  const cancelled = allDonations.filter((d) => d.status === "cancelled")
  const oneTime = allDonations.filter((d) => d.status === "one_time")

  const monthlyRevenue = active.reduce((sum, d) => sum + d.amountCents, 0)
  const oneTimeRevenue = oneTime.reduce((sum, d) => sum + d.amountCents, 0)
  // Total collected = recurring monthly revenue + all one-time donations
  const totalRevenue = monthlyRevenue + oneTimeRevenue

  // Entries split by type
  const monthlyEntries = active.reduce((sum, d) => sum + d.entries, 0)
  const oneTimeEntries = oneTime.reduce((sum, d) => sum + d.entries, 0)
  const totalEntries = monthlyEntries + oneTimeEntries

  return {
    totalDonors: allDonations.length,
    activeDonors: active.length,
    cancelledDonors: cancelled.length,
    oneTimeDonors: oneTime.length,
    monthlyRevenue: monthlyRevenue / 100,
    oneTimeRevenue: oneTimeRevenue / 100,
    totalRevenue: totalRevenue / 100,
    monthlyEntries,
    oneTimeEntries,
    totalEntries,
  }
}

export async function exportDonationsCSV(filter: DonationFilter = "all") {
  const data = await getDonations(filter)
  
  const headers = [
    "ID",
    "Name",
    "Email",
    "Phone",
    "Address",
    "City",
    "State",
    "Postal Code",
    "Country",
    "Entries",
    "Amount ($)",
    "Status",
    "Created At",
    "Cancelled At",
  ]
  
  const rows = (Array.isArray(data) ? data : []).map((d) => [
    d.id,
    d.name,
    d.email,
    d.phone || "",
    d.addressLine1 || "",
    d.addressCity || "",
    d.addressState || "",
    d.addressPostalCode || "",
    d.addressCountry || "",
    d.entries,
    (d.amountCents / 100).toFixed(2),
    d.status,
    d.createdAt ? new Date(d.createdAt).toISOString() : "",
    d.cancelledAt ? new Date(d.cancelledAt).toISOString() : "",
  ])
  
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n")
  
  return csvContent
}
