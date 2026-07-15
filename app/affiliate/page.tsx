import { getAffiliateSession } from "@/lib/auth"
import { getMyReferrals } from "@/app/actions/affiliates"
import { AffiliateLogin } from "./login"
import { AffiliateDashboard } from "./dashboard"

export const dynamic = "force-dynamic"

export default async function AffiliatePage() {
  const code = await getAffiliateSession()

  if (!code) {
    return <AffiliateLogin />
  }

  const data = await getMyReferrals()

  return <AffiliateDashboard data={data} />
}
