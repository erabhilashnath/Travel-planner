export interface PublicHoliday {
  date: string; // YYYY-MM-DD
  localName: string;
  name: string;
}

/**
 * Free, no-key public holiday lookup via Nager.Date. Best-effort: any
 * failure (network, unsupported country, rate limit) returns an empty list
 * rather than breaking the calendar page.
 */
export async function getPublicHolidays(countryCode: string, year: number): Promise<PublicHoliday[]> {
  try {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`, {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return [];
    return (await res.json()) as PublicHoliday[];
  } catch {
    return [];
  }
}
