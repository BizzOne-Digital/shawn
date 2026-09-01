import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { z } from "zod";
import { sendPasswordResetEmail } from "@/lib/services/email";
import { absoluteUrl } from "@/lib/utils";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = schema.parse(body);

    const user = await db.user.findUnique({ where: { email } });

    if (user) {
      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      await db.passwordResetToken.deleteMany({ where: { email } });
      await db.passwordResetToken.create({ data: { email, token, expires } });

      const resetUrl = absoluteUrl(`/reset-password?token=${token}`);

      try {
        await sendPasswordResetEmail(email, resetUrl);
      } catch (emailError) {
        console.error("[forgot-password] Failed to send reset email:", emailError);
        return NextResponse.json(
          {
            error:
              "We could not send the reset email right now. Please try again later or contact support.",
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    console.error("[forgot-password] Unexpected error:", error);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
