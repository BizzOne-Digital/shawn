import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireBusinessOwnerApi, handleApiError } from "@/lib/api-utils";
import { saveAndSubmitBusiness } from "@/lib/services/business-submission";

export async function POST(request: Request) {
  try {
    const authResult = await requireBusinessOwnerApi();
    if ("error" in authResult) return authResult.error;

    const body = await request.json();
    const businessId =
      typeof body.businessId === "string" ? body.businessId.trim() : undefined;
    const { businessId: _omit, ...formData } = body;

    const business = await saveAndSubmitBusiness(
      authResult.user.id,
      businessId,
      formData
    );

    return NextResponse.json(business);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message ?? "Please complete all required fields" },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message.includes("cannot be submitted")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return handleApiError(error);
  }
}
