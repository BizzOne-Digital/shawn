import { NextResponse } from "next/server";
import { getMinimumDailyBid } from "@/lib/services/ad-settings";

export async function GET() {
  const minimumDailyBid = await getMinimumDailyBid();

  return NextResponse.json({ minimumDailyBid });
}
