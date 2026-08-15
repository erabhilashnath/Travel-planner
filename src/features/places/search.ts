import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/features/auth/config";
import { searchNominatim } from "@/server/nominatim";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q") ?? "";
  const results = await searchNominatim(query);

  return NextResponse.json({ results });
}
