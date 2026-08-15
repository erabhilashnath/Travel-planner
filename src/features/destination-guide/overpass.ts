import { haversineKm } from "@/lib/distance";
import { OSM_USER_AGENT } from "@/server/nominatim";

export interface NearbyPlace {
  name: string;
  category: string;
  km: number;
}

interface OverpassElement {
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

const RADIUS_METERS = 8000;
const MAX_RESULTS = 8;

async function queryOverpass(
  origin: { lat: number; lng: number },
  clauses: string[],
): Promise<NearbyPlace[]> {
  // nwr = node/way/relation combined — hospitals etc. are frequently mapped as a building
  // outline (way) rather than a single point (node), so a node-only query silently misses them.
  const body = `[out:json][timeout:20];(${clauses
    .map((c) => `nwr${c}(around:${RADIUS_METERS},${origin.lat},${origin.lng});`)
    .join("")});out center ${MAX_RESULTS * 3};`;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "text/plain", "User-Agent": OSM_USER_AGENT },
      body,
      next: { revalidate: 60 * 60 * 24 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];

    const data: OverpassResponse = await res.json();
    const places = data.elements
      .map((el) => {
        const name = el.tags?.name;
        const lat = el.lat ?? el.center?.lat;
        const lon = el.lon ?? el.center?.lon;
        if (!name || lat === undefined || lon === undefined) return null;
        const category =
          el.tags?.amenity ?? el.tags?.tourism ?? el.tags?.leisure ?? "place";
        return {
          name,
          category,
          km: haversineKm(origin, { lat, lng: lon }),
        };
      })
      .filter((p): p is NearbyPlace => p !== null)
      .sort((a, b) => a.km - b.km)
      .slice(0, MAX_RESULTS);

    return places;
  } catch {
    return [];
  }
}

export function getNearbyEmergencyServices(origin: { lat: number; lng: number }) {
  return queryOverpass(origin, [
    '["amenity"="hospital"]',
    '["amenity"="police"]',
    '["amenity"="pharmacy"]',
  ]);
}

export function getNearbyActivities(origin: { lat: number; lng: number }) {
  return queryOverpass(origin, [
    '["tourism"="attraction"]',
    '["tourism"="museum"]',
    '["tourism"="viewpoint"]',
    '["leisure"="park"]',
  ]);
}
