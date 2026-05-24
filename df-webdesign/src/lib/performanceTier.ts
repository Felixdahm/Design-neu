export type Tier = "low" | "high";

// Low tier: touch device with < 8 cores — covers phones and mid-range tablets.
// Called once per session; navigator properties don't change at runtime.
export function getPerformanceTier(): Tier {
  if (typeof window === "undefined") return "high";
  const touch = navigator.maxTouchPoints > 0;
  const cores = navigator.hardwareConcurrency ?? 4;
  return touch && cores < 8 ? "low" : "high";
}
