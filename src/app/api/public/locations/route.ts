import { NextResponse } from "next/server";
import { getPublicSearchCities } from "@/lib/queries/locations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cities = await getPublicSearchCities();
    return NextResponse.json({ cities });
  } catch {
    return NextResponse.json({ cities: [] });
  }
}
