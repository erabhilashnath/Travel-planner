export interface MonthlyClimate {
  month: string; // "Jan", "Feb", ...
  avgTempC: number;
  totalPrecipitationMm: number;
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface ArchiveResponse {
  daily?: {
    time: string[];
    temperature_2m_mean: (number | null)[];
    precipitation_sum: (number | null)[];
  };
}

/**
 * Monthly average temperature + total rainfall, derived from the last full
 * calendar year of Open-Meteo's free historical weather archive (no key).
 * Used as a stand-in for "typical" climate — a real climate-normals product
 * would average many years, but one recent year is a reasonable free
 * approximation for "roughly what to expect." Best-effort: returns null on
 * any failure so the rest of the destination guide still renders.
 */
export async function getMonthlyClimate(
  lat: number,
  lng: number,
): Promise<MonthlyClimate[] | null> {
  const lastFullYear = new Date().getUTCFullYear() - 1;
  const url = new URL("https://archive-api.open-meteo.com/v1/archive");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("start_date", `${lastFullYear}-01-01`);
  url.searchParams.set("end_date", `${lastFullYear}-12-31`);
  url.searchParams.set("daily", "temperature_2m_mean,precipitation_sum");
  url.searchParams.set("timezone", "auto");

  try {
    const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 7 } });
    if (!res.ok) return null;
    const data: ArchiveResponse = await res.json();
    if (!data.daily) return null;

    const { time, temperature_2m_mean, precipitation_sum } = data.daily;
    const tempByMonth: number[][] = Array.from({ length: 12 }, () => []);
    const precipByMonth: number[] = Array(12).fill(0);

    time.forEach((date, i) => {
      const month = Number(date.slice(5, 7)) - 1;
      const temp = temperature_2m_mean[i];
      const precip = precipitation_sum[i];
      if (temp !== null) tempByMonth[month].push(temp);
      if (precip !== null) precipByMonth[month] += precip;
    });

    return MONTH_LABELS.map((label, i) => {
      const temps = tempByMonth[i];
      const avgTempC = temps.length
        ? temps.reduce((a, b) => a + b, 0) / temps.length
        : 0;
      return {
        month: label,
        avgTempC: Math.round(avgTempC * 10) / 10,
        totalPrecipitationMm: Math.round(precipByMonth[i]),
      };
    });
  } catch {
    return null;
  }
}
