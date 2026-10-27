import "server-only"

import { easternDateToday } from "@/lib/grant-donation"

const CAPTURE_URL = "https://api.pledgercharitable.org/api/Funds/Capture"
const UNAVAILABLE = "Pledger is temporarily unavailable. Please use another payment method."

function getConfig() {
  const token = process.env.PLEDGER_API_TOKEN
  const taxId = process.env.PLEDGER_TAX_ID || process.env.DONORS_FUND_TAX_ID
  if (!token || !taxId) return null
  return {
    token,
    taxId,
    charityId: process.env.PLEDGER_CHARITY_ID,
    charityName: process.env.PLEDGER_CHARITY_NAME || "Ohr Moshe",
    recurringCount: Number(process.env.PLEDGER_RECURRING_COUNT) || 12,
  }
}

export type PledgerResult = { ok: true; refNum: string } | { ok: false; error: string }

export async function capturePledgerGrant(input: {
  amountCents: number
  cardNumber: string
  cvv: string
  expDate: string
  invoice: string
  description: string
}): Promise<PledgerResult> {
  const config = getConfig()
  if (!config) {
    console.error("[pledger] Missing PLEDGER_API_TOKEN or tax ID")
    return { ok: false, error: UNAVAILABLE }
  }

  const body: Record<string, string | number> = {
    TaxID: config.taxId,
    CharityName: config.charityName,
    Command: "grant:donate",
    Cardnumber: input.cardNumber,
    CVV: input.cvv,
    ExpDate: input.expDate,
    Amount: (input.amountCents / 100).toFixed(2),
    Invoice: input.invoice,
    Description: input.description,
    CampaignRef: "Watch & Learn",
    RecurringType: "Monthly",
    RecurringCount: config.recurringCount,
    BeginDate: easternDateToday(),
  }
  if (config.charityId) body.CharityId = config.charityId

  let json: Record<string, unknown>
  try {
    const res = await fetch(CAPTURE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.token}` },
      body: JSON.stringify(body),
      cache: "no-store",
    })
    if (res.status === 401 || res.status === 403) {
      console.error("[pledger] Authorization rejected", res.status)
      return { ok: false, error: UNAVAILABLE }
    }
    json = await res.json()
  } catch (error) {
    console.error("[pledger] Request failed:", error instanceof Error ? error.message : String(error))
    return { ok: false, error: "We couldn't reach Pledger. Please try again in a moment." }
  }

  const status = String(json?.Status ?? json?.status ?? "")
  const refNum = String(json?.Refnum ?? json?.RefNum ?? json?.refnum ?? "")
  if (status.toLowerCase() === "approved") return { ok: true, refNum: refNum || input.invoice }

  const message = json?.ErrorMessage ?? json?.errorMessage
  console.error("[pledger] Grant declined", { status, error: message })
  return {
    ok: false,
    error: typeof message === "string" && message ? message : "Your Pledger grant could not be processed.",
  }
}
