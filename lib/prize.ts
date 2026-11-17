// This month's prize. Update every field here when the watch changes —
// `previousValueUsd` is the advertised value of the watch drawn the month
// before, and the "more than last month" line only shows while this month's
// value is higher.
export const CURRENT_PRIZE = {
  name: "Rolex Sky-Dweller 42",
  shortName: "Rolex Sky-Dweller",
  details: "Ref. 336934 · Green Dial · Jubilee Bracelet",
  description:
    "Rolex's annual-calendar travel watch: a second time zone on the dial and a date that only needs setting once a year.",
  highlights: ["Annual calendar", "Second time zone", "Fluted white gold bezel"],
  image: "/images/rolex-sky-dweller-336934-green.avif",
  imageAlt: "Rolex Sky-Dweller 42mm reference 336934 with green dial, fluted bezel, and Jubilee bracelet",
  valueUsd: 28000,
  previousValueUsd: 17000,
}

export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`
}

export const PRIZE_VALUE_LABEL = formatUsd(CURRENT_PRIZE.valueUsd)

const increase = CURRENT_PRIZE.valueUsd - CURRENT_PRIZE.previousValueUsd
export const PRIZE_INCREASE_LABEL: string | null = increase > 0 ? formatUsd(increase) : null
