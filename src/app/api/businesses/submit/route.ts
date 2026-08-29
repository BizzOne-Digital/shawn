import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { requireBusinessOwnerApi, handleApiError } from "@/lib/api-utils";
import {
  hasBusinessFormPayload,
  saveAndSubmitBusiness,
  submitOwnedBusiness,
} from "@/lib/services/business-submission";

export async function POST(request: Request) {
  try {
    const authResult = await requireBusinessOwnerApi();
    if ("error" in authResult) return authResult.error;

    const body = await request.json();
    const businessId =
      typeof body.businessId === "string" ? body.businessId.trim() : undefined;
    const { businessId: _omit, ...formData } = body;

    if (!businessId && !hasBusinessFormPayload(formData)) {
      return NextResponse.json(
        { error: "Please complete all required fields before submitting" },
        { status: 400 }
      );
    }

    const business =
      businessId && !hasBusinessFormPayload(formData)
        ? await submitOwnedBusiness(authResult.user.id, businessId)
        : await saveAndSubmitBusiness(
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
    if (error instanceof Error && error.message === "Business not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof Error && error.message.includes("cannot be submitted")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2031") {
      return NextResponse.json(
        {
          error:
            "Submission is temporarily unavailable. Please try again shortly or contact support.",
        },
        { status: 503 }
      );
    }
    return handleApiError(error);
  }
}
