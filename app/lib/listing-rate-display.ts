type Rate = number | null | undefined;

function isKnownRate(rate: Rate): rate is number {
  return typeof rate === "number" && Number.isFinite(rate) && rate >= 0;
}

export function listingRateLabels(hourly: Rate, daily?: Rate): string[] {
  if ((hourly != null && !isKnownRate(hourly)) || (daily != null && !isKnownRate(daily))) {
    return ["Pricing needs review"];
  }
  const labels: string[] = [];
  if (isKnownRate(hourly)) labels.push(`$${hourly}/hr`);
  if (isKnownRate(daily)) labels.push(`$${daily}/day`);
  return labels.length ? labels : ["Rate not set"];
}

export function matchesHourlyPrice(hourly: Rate, min?: number, max?: number): boolean {
  if (min == null && max == null) return true;
  if (!isKnownRate(hourly)) return false;
  return (min == null || hourly >= min) && (max == null || hourly <= max);
}
