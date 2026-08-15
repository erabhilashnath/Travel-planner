import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/features/auth/config";
import { searchNominatim } from "@/server/nominatim";
import { getWikipediaSummary } from "@/features/destination-guide/wikipedia";
import { getNearbyEmergencyServices, getNearbyActivities } from "@/features/destination-guide/overpass";
import { getMonthlyClimate } from "@/features/destination-guide/climate";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ error: "Enter a destination to look up" }, { status: 400 });
  }

  const [place] = await searchNominatim(query, 1);
  if (!place) {
    return NextResponse.json({ error: "Couldn't find that place — try a different spelling" }, { status: 404 });
  }

  const origin = { lat: place.lat, lng: place.lng };

  // The two Overpass queries hit the same free public endpoint, which is more prone to
  // timeouts/rate-limiting under concurrent load than the other sources — run them one after
  // another to reduce that risk, while still running in parallel with Wikipedia/climate.
  const [wikipedia, climate, [emergencyServices, activities]] = await Promise.all([
    getWikipediaSummary(query),
    getMonthlyClimate(origin.lat, origin.lng),
    (async () => {
      const emergency = await getNearbyEmergencyServices(origin);
      const nearby = await getNearbyActivities(origin);
      return [emergency, nearby] as const;
    })(),
  ]);

  return NextResponse.json({
    place,
    wikipedia,
    emergencyServices,
    activities,
    climate,
  });
}
