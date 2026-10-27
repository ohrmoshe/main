import "server-only"

// The Donors' Fund grant API. API keys are public per their docs; the
// Validation-Token is the charity's secret and must stay server-side.
const ENVIRONMENTS = {
  sandbox: {
    baseUrl: "https://api.tdfcharitable.org/thedonorsfund/integration",
    apiKey: "3Q1i2KzHmUCiPDr8gCtiRQB6ZtIJBVjEKwSUGwFdtfvw",
  },
  production: {
    baseUrl: "https://api.thedonorsfund.org/thedonorsfund/integration",
    apiKey: "CXtaaW9xqUafyffApPbfVQD0MmLhdprESvor9vi2GNLQ",
  },
} as const

function getConfig() {
  const env = process.env.DONORS_FUND_ENV === "sandbox" ? ENVIRONMENTS.sandbox : ENVIRONMENTS.production
  const validationToken = process.env.DONORS_FUND_VALIDATION_TOKEN
  const accountNumber = process.env.DONORS_FUND_ACCOUNT_NUMBER
  const taxId = process.env.DONORS_FUND_TAX_ID
  if (!validationToken || !accountNumber) return null
  return { ...env, validationToken, accountNumber, taxId }
}

export function isDonorsFundConfigured() {
  return getConfig() !== null
}

// Error codes caused by our own configuration rather than the donor's card.
// Donors get a generic message for these; details go to the server log.
const CONFIG_ERROR_CODES = new Set([3109, 3112, 3201, 3204, 3209, 3210, 3211, 3213])

export type GrantResult =
  | { ok: true; transactionId: string; confirmationNumber: string; status: string }
  | { ok: false; error: string }

function startDateToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date())
  const get = (type: string) => parts.find((p) => p.type === type)?.value
  return `${get("month")}/${get("day")}/${get("year")}`
}

export async function createGrant(input: {
  amountCents: number
  donor: string
  donorAuthorization: string
  monthly: boolean
  purposeNote: string
}): Promise<GrantResult> {
  const config = getConfig()
  if (!config) {
    console.error("[donors-fund] Missing DONORS_FUND_VALIDATION_TOKEN or DONORS_FUND_ACCOUNT_NUMBER")
    return { ok: false, error: "The Donors' Fund is temporarily unavailable. Please use another payment method." }
  }

  const body: Record<string, unknown> = {
    accountNumber: config.accountNumber,
    amount: (input.amountCents / 100).toFixed(2),
    donor: input.donor,
    donorAuthorization: input.donorAuthorization,
    purposeType: "Other",
    purposeNote: input.purposeNote,
  }
  if (config.taxId) body.taxId = config.taxId
  if (input.monthly) {
    body.recurring = { scheduleType: "monthly", startDate: startDateToday(), numberOfPayments: 0 }
  }

  let json: Record<string, any>
  try {
    const res = await fetch(`${config.baseUrl}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": config.apiKey,
        "Validation-Token": config.validationToken,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })
    json = await res.json()
  } catch (error) {
    console.error("[donors-fund] Request failed:", error instanceof Error ? error.message : String(error))
    return { ok: false, error: "We couldn't reach The Donors' Fund. Please try again in a moment." }
  }

  const data = json?.data
  if (data?.transactionId && (json.errorCode === 0 || json.errorCode == null)) {
    return {
      ok: true,
      transactionId: String(data.transactionId),
      confirmationNumber: String(data.confirmationNumber ?? ""),
      status: String(data.status ?? ""),
    }
  }

  const code = Number(json?.errorCode)
  console.error("[donors-fund] Grant declined", { errorCode: code, error: json?.error })
  if (CONFIG_ERROR_CODES.has(code)) {
    return { ok: false, error: "The Donors' Fund is temporarily unavailable. Please use another payment method." }
  }
  return { ok: false, error: typeof json?.error === "string" ? json.error : "Your grant could not be processed." }
}
