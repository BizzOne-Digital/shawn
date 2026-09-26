import { z } from "zod";
import {
  buildLgbEmailAddress,
  LGB_EMAIL_DOMAIN,
  LGB_EMAIL_MIN_LOCAL_PART_LENGTH,
  normalizeLocalPart,
} from "@/lib/lgb-email-utils";

export {
  LGB_EMAIL_DOMAIN,
  LGB_EMAIL_REQUEST_TO,
  LGB_EMAIL_MIN_LOCAL_PART_LENGTH,
  buildLgbEmailAddress,
} from "@/lib/lgb-email-utils";

function requestedAddressField(label: string) {
  return z
    .string()
    .min(1, label)
    .superRefine((value, ctx) => {
      const localPart = normalizeLocalPart(value);
      if (localPart.length < LGB_EMAIL_MIN_LOCAL_PART_LENGTH) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Email name must be at least ${LGB_EMAIL_MIN_LOCAL_PART_LENGTH} characters`,
        });
      }
    })
    .transform(buildLgbEmailAddress)
    .pipe(
      z
        .string()
        .regex(
          new RegExp(`^[^\\s@]+@${LGB_EMAIL_DOMAIN.replace(".", "\\.")}$`, "i"),
          `Must be a valid @${LGB_EMAIL_DOMAIN} address`
        )
    );
}

export const lgbEmailRequestSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Enter a valid contact email"),
    requestedAddress: requestedAddressField("Choose your preferred @LetsGoBuffalo.com address"),
    backupAddress: requestedAddressField("Choose a backup @LetsGoBuffalo.com address"),
    forwardTo: z.string().email("Enter the email where mail should forward"),
    businessName: z.string().optional(),
    phone: z.string().min(10, "Phone number is required").max(20),
    captchaToken: z.string().min(1, "Captcha is required"),
    captchaAnswer: z.string().min(1, "Please answer the security check"),
    promoCode: z.string().optional(),
  })
  .refine((data) => data.requestedAddress !== data.backupAddress, {
    message: "Backup address must be different from your first choice",
    path: ["backupAddress"],
  });

export type LgbEmailRequestInput = z.infer<typeof lgbEmailRequestSchema>;
