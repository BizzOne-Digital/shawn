import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi, recordAuditLog } from "@/lib/admin-utils";
import { handleApiError } from "@/lib/api-utils";
import { USER_NOT_DELETED } from "@/lib/prisma-mongo-filters";

const creditSchema = z.object({
  amount: z.coerce.number().min(0.01, "Amount must be at least $0.01").max(10000),
  note: z.string().max(500).optional(),
  campaignId: z.string().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const { user: admin, error } = await requireAdminApi();
    if (error) return error;

    const { id: userId } = await context.params;
    const body = await request.json();
    const data = creditSchema.parse(body);

    const targetUser = await db.user.findFirst({
      where: { id: userId, ...USER_NOT_DELETED },
      include: { wallet: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const description =
      data.note?.trim() ||
      `Admin advertising credit by ${admin!.email}`;

    const metadata: Record<string, string> = { creditedBy: admin!.id };
    if (data.campaignId) {
      metadata.campaignId = data.campaignId;
    }

    const [wallet, transaction] = await db.$transaction([
      db.wallet.upsert({
        where: { userId },
        create: { userId, balance: data.amount },
        update: { balance: { increment: data.amount } },
      }),
      db.transaction.create({
        data: {
          userId,
          type: "CREDIT",
          status: "COMPLETED",
          amount: data.amount,
          description,
          metadata,
        },
      }),
    ]);

    await recordAuditLog({
      userId: admin!.id,
      action: "WALLET_CREDIT",
      entity: "Wallet",
      entityId: wallet.id,
      metadata: {
        targetUserId: userId,
        targetEmail: targetUser.email,
        amount: data.amount,
        transactionId: transaction.id,
        note: data.note,
        campaignId: data.campaignId,
      },
    });

    return NextResponse.json({
      balance: wallet.balance,
      transactionId: transaction.id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
