import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/features/auth/config";

const NOMINATIM_USER_AGENT =
  "TravelPlannerApp/1.0 (personal project; https://github.com/erabhilashnath/Travel-planner)";

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");

  const response = await fetch(url, {
    headers: {
      "User-Agent": NOMINATIM_USER_AGENT,
      "Accept-Language": "en",
    },
  });

  if (!response.ok) {
    return NextResponse.json({ results: [] });
  }

  const data: NominatimResult[] = await response.json();

  return NextResponse.json({
    results: data.map((item) => ({
      label: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon),
    })),
  });
}
