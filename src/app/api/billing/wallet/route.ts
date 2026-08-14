import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSessionUser } from "@/lib/api-utils";

export async function GET() {
  const result = await requireSessionUser();
  if ("error" in result) return result.error;

  const wallet = await db.wallet.findUnique({
    where: { userId: result.user.id },
  });

  const transactions = await db.transaction.findMany({
    where: { userId: result.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    balance: Number(wallet?.balance ?? 0),
    transactions: transactions.map((tx) => ({
      ...tx,
      amount: Number(tx.amount),
    })),
  });
}
