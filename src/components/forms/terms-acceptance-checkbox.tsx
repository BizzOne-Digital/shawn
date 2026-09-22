import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { TERMS_PATH } from "@/lib/constants/terms";

interface TermsAcceptanceCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
}

export function TermsAcceptanceCheckbox({
  checked,
  onCheckedChange,
  id = "accept-terms",
}: TermsAcceptanceCheckboxProps) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
        className="mt-0.5"
      />
      <span className="text-sm text-muted leading-snug">
        I agree to the{" "}
        <Link href={TERMS_PATH} className="text-navy font-medium hover:text-buffalo-red underline-offset-2 hover:underline" target="_blank">
          Terms &amp; Conditions
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-navy font-medium hover:text-buffalo-red underline-offset-2 hover:underline" target="_blank">
          Privacy Policy
        </Link>
        .
      </span>
    </label>
  );
}
