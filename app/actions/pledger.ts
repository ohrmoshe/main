"use server"

import { randomUUID } from "node:crypto"
import { capturePledgerGrant } from "@/lib/pledger"
import { recordApprovedGrant, resolvePlan, validateDonor, type GrantPlan } from "@/lib/grant-donation"

export interface PledgerInput {
  plan: GrantPlan
  name: string
  email: string
  cardNumber: string
  cvv: string
  expDate: string
  consent: { email: boolean; sms: boolean }
}

export type PledgerResponse =
  | { ok: true; entries: number; amount: number; refNum: string }
  | { ok: false; error: string }

export async function submitPledgerGrant(input: PledgerInput): Promise<PledgerResponse> {
  const person = validateDonor(input)
  if (!person.ok) return person

  const cardNumber = input.cardNumber?.replace(/\D/g, "") ?? ""
  const cvv = input.cvv?.trim() ?? ""
  const expDate = input.expDate?.replace(/\D/g, "") ?? ""
  if (!/^\d{16}$/.test(cardNumber)) return { ok: false, error: "Enter your 16-digit Pledger card number." }
  if (!/^\d{3,4}$/.test(cvv)) return { ok: false, error: "Enter your card's CVV." }
  const month = Number(expDate.slice(0, 2))
  if (!/^\d{4}$/.test(expDate) || month < 1 || month > 12) {
    return { ok: false, error: "Enter the expiration date as MM/YY." }
  }

  const resolved = resolvePlan(input.plan)
  if (!resolved) return { ok: false, error: "Please choose a valid donation plan." }

  const invoice = `WL-${randomUUID().slice(0, 8).toUpperCase()}`
  const grant = await capturePledgerGrant({
    amountCents: resolved.amountCents,
    cardNumber,
    cvv,
    expDate,
    invoice,
    description: `Watch & Learn ${resolved.label} - ${resolved.entries} entries`,
  })
  if (!grant.ok) return grant

  await recordApprovedGrant({
    source: "pledger",
    externalId: grant.refNum,
    name: person.name,
    email: person.email,
    entries: resolved.entries,
    amountCents: resolved.amountCents,
    consent: input.consent,
  })

  return { ok: true, entries: resolved.entries, amount: resolved.amountCents / 100, refNum: grant.refNum }
}
