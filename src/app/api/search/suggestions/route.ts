import { NextResponse } from "next/server";
import { getSearchSuggestions } from "@/lib/services/search";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await getSearchSuggestions(q, 8);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("[search/suggestions]", error);
    return NextResponse.json({ suggestions: [] });
  }
}
