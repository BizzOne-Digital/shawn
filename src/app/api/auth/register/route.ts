import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { UserRole, MemberType } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const existing = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This email is already registered. Try signing in instead." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(data.password, 12);

    const isIndividual = data.memberType === MemberType.INDIVIDUAL;

    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        phone: data.phone,
        role: isIndividual ? UserRole.INDIVIDUAL : UserRole.BUSINESS_OWNER,
        memberType: data.memberType,
      },
    });

    try {
      await db.wallet.create({
        data: {
          userId: user.id,
          balance: 0,
        },
      });
    } catch (walletError) {
      await db.user.delete({ where: { id: user.id } }).catch(() => undefined);
      throw walletError;
    }

    return NextResponse.json(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2031") {
        return NextResponse.json(
          {
            error:
              "Sign-up is temporarily unavailable. Please try again shortly or contact support.",
          },
          { status: 503 }
        );
      }
    }
    console.error("Registration failed:", error);
    return NextResponse.json(
      { error: "Registration failed. Please check your details and try again." },
      { status: 500 }
    );
  }
}
