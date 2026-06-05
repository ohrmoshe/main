"use server"

import { db } from "@/lib/db"
import { donations } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"

export async function getDonations(filter: "all" | "active" | "cancelled" = "all") {
  let query = db.select().from(donations).orderBy(desc(donations.createdAt))

  if (filter === "active") {
    const results = await db
      .select()
      .from(donations)
      .where(eq(donations.status, "active"))
      .orderBy(desc(donations.createdAt))
    return results
  } else if (filter === "cancelled") {
    const results = await db
      .select()
      .from(donations)
      .where(eq(donations.status, "cancelled"))
      .orderBy(desc(donations.createdAt))
    return results
  }

  return query
}

export async function getDonationStats() {
  const allDonations = await db.select().from(donations)
  
  const active = allDonations.filter((d) => d.status === "active")
  const cancelled = allDonations.filter((d) => d.status === "cancelled")
  
  const totalActiveRevenue = active.reduce((sum, d) => sum + d.amountCents, 0)
  const totalActiveEntries = active.reduce((sum, d) => sum + d.entries, 0)
  
  return {
    totalDonors: allDonations.length,
    activeDonors: active.length,
    cancelledDonors: cancelled.length,
    monthlyRevenue: totalActiveRevenue / 100,
    totalEntries: totalActiveEntries,
  }
}

export async function exportDonationsCSV(filter: "all" | "active" | "cancelled" = "all") {
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
