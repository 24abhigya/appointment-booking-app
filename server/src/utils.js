export function toISO(d) {
  return new Date(d).toISOString();
}

export function parseDateOnly(yyyy_mm_dd) {
  // returns a Date at 00:00:00 UTC of that day
  const [y, m, d] = yyyy_mm_dd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

export function next7DaysRangeUTC(fromDate) {
  // fromDate inclusive to fromDate + 6 days inclusive, till end of last day
  const start = new Date(Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), fromDate.getUTCDate(), 0, 0, 0, 0));
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 7, 0, 0, 0, 0)); // exclusive
  return { start, end };
}

export function* generateDaySlotsUTC(dateUTC) {
  // 09:00 to 17:00 UTC, 30-min blocks
  for (let h = 9; h < 17; h++) {
    for (let m = 0; m < 60; m += 30) {
      const start = new Date(Date.UTC(dateUTC.getUTCFullYear(), dateUTC.getUTCMonth(), dateUTC.getUTCDate(), h, m, 0, 0));
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      yield { start, end };
    }
  }
}

export function* generateSlotsForRangeUTC(startInclusive, endExclusive) {
  for (let d = new Date(startInclusive); d < endExclusive; d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1))) {
    yield* generateDaySlotsUTC(d);
  }
}
