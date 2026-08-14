import { db } from "@/lib/db";
import { sendListingStatusEmail } from "@/lib/services/email";

export async function notifyBusinessOwner(
  businessId: string,
  businessName: string,
  statusLabel: string,
  message?: string
) {
  const business = await db.business.findUnique({
    where: { id: businessId },
    select: { owner: { select: { email: true } } },
  });

  if (business?.owner?.email) {
    await sendListingStatusEmail(
      business.owner.email,
      businessName,
      statusLabel,
      message
    );
  }
}
