import { z } from "zod";

export const LGB_EMAIL_DOMAIN = "letsgobuffalo.com";
export const LGB_EMAIL_REQUEST_TO = "emailrequest@letsgobuffalo.com";

const localPartSchema = z
  .string()
  .min(1, "Choose a name for your email address")
  .max(64, "Email name is too long")
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/,
    "Use letters, numbers, dots, dashes, or underscores (must start with a letter or number)"
  );

export function buildLgbEmailAddress(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  if (trimmed.includes("@")) {
    const [localPart] = trimmed.split("@");
    return `${localPart.toLowerCase()}@${LGB_EMAIL_DOMAIN}`;
  }

  return `${trimmed.toLowerCase()}@${LGB_EMAIL_DOMAIN}`;
}

function requestedAddressField(label: string) {
  return z
    .string()
    .min(1, label)
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
  })
  .refine((data) => data.requestedAddress !== data.backupAddress, {
    message: "Backup address must be different from your first choice",
    path: ["backupAddress"],
  });

export type LgbEmailRequestInput = z.infer<typeof lgbEmailRequestSchema>;
