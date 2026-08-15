export const OSM_USER_AGENT =
  "TravelPlannerApp/1.0 (personal project; https://github.com/erabhilashnath/Travel-planner)";

export interface NominatimPlace {
  label: string;
  lat: number;
  lng: number;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

/**
 * Free-text search against OpenStreetMap's Nominatim geocoder. Shared by
 * any feature that needs to turn a place name into coordinates (Places,
 * Destination Guide). No API key; respects Nominatim's usage policy via a
 * descriptive User-Agent.
 */
export async function searchNominatim(query: string, limit = 5): Promise<NominatimPlace[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", trimmed);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(limit));

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": OSM_USER_AGENT,
        "Accept-Language": "en",
      },
    });
    if (!response.ok) return [];

    const data: NominatimResult[] = await response.json();
    return data.map((item) => ({
      label: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon),
    }));
  } catch {
    return [];
  }
}
