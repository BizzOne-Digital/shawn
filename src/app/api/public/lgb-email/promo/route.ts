import { NextResponse } from "next/server";
import { findActiveEmailPromoCode, formatEmailPromoSummary } from "@/lib/services/email-promo";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code")?.trim();
  if (!code) {
    return NextResponse.json({ valid: false, error: "Code is required" }, { status: 400 });
  }

  const promo = await findActiveEmailPromoCode(code);
  if (!promo) {
    return NextResponse.json({ valid: false, error: "Invalid or expired discount code" });
  }

  return NextResponse.json({
    valid: true,
    code: promo.code,
    type: promo.type,
    value: promo.value,
    summary: formatEmailPromoSummary(promo.type, promo.value),
  });
}
