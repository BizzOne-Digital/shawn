/** Normalize membership plan feature labels for public display. */
export function formatPlanFeatureLabel(feature: string): string {
  const trimmed = feature.trim();
  if (/lgb|custom email|@letsgobuffalo\.com/i.test(trimmed)) {
    return "@LetsGoBuffalo Email";
  }
  return trimmed;
}
