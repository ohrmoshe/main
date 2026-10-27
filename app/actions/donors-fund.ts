"use server"

import { createGrant } from "@/lib/donors-fund"
import { EMAIL_RE, recordApprovedGrant, resolvePlan, validateDonor, type GrantPlan } from "@/lib/grant-donation"

export type DonorsFundPlan = GrantPlan

export interface DonorsFundInput {
  plan: DonorsFundPlan
  name: string
  email: string
  donor: string
  donorAuthorization: string
  consent: { email: boolean; sms: boolean }
}

export type DonorsFundResponse =
  | { ok: true; entries: number; amount: number; confirmationNumber: string }
  | { ok: false; error: string }

export async function submitDonorsFundGrant(input: DonorsFundInput): Promise<DonorsFundResponse> {
  const person = validateDonor(input)
  if (!person.ok) return person

  const donor = input.donor?.replace(/\s+/g, "") ?? ""
  const donorAuthorization = input.donorAuthorization?.trim() ?? ""
  if (!/^\d{16}$/.test(donor) && !EMAIL_RE.test(donor)) {
    return { ok: false, error: "Enter your 16-digit giving card number or your Donors' Fund username." }
  }
  if (!/^\d{3,4}$/.test(donorAuthorization)) {
    return { ok: false, error: "Enter your card's 3-digit CVV or 4-digit PIN." }
  }

  const resolved = resolvePlan(input.plan)
  if (!resolved) return { ok: false, error: "Please choose a valid donation plan." }

  const grant = await createGrant({
    amountCents: resolved.amountCents,
    donor,
    donorAuthorization,
    monthly: true,
    purposeNote: `Watch & Learn ${resolved.label}`,
  })
  if (!grant.ok) return grant

  await recordApprovedGrant({
    source: "tdf",
    externalId: grant.transactionId,
    name: person.name,
    email: person.email,
    entries: resolved.entries,
    amountCents: resolved.amountCents,
    consent: input.consent,
  })

  return {
    ok: true,
    entries: resolved.entries,
    amount: resolved.amountCents / 100,
    confirmationNumber: grant.confirmationNumber,
  }
}
