export interface WikipediaSummary {
  title: string;
  extract: string;
  thumbnailUrl: string | null;
  pageUrl: string;
}

interface SearchResponse {
  query?: { search?: { title: string }[] };
}

interface SummaryResponse {
  title: string;
  extract: string;
  thumbnail?: { source: string };
  content_urls?: { desktop?: { page?: string } };
}

/**
 * Best-effort: search Wikipedia for the closest-matching page to a place
 * name, then fetch its summary. Returns null on any failure (no matching
 * page, network error, etc.) rather than throwing.
 */
export async function getWikipediaSummary(query: string): Promise<WikipediaSummary | null> {
  try {
    const searchUrl = new URL("https://en.wikipedia.org/w/api.php");
    searchUrl.searchParams.set("action", "query");
    searchUrl.searchParams.set("list", "search");
    searchUrl.searchParams.set("srsearch", query);
    searchUrl.searchParams.set("srlimit", "1");
    searchUrl.searchParams.set("format", "json");
    searchUrl.searchParams.set("origin", "*");

    const searchRes = await fetch(searchUrl, { next: { revalidate: 60 * 60 * 24 } });
    if (!searchRes.ok) return null;
    const searchData: SearchResponse = await searchRes.json();
    const title = searchData.query?.search?.[0]?.title;
    if (!title) return null;

    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { next: { revalidate: 60 * 60 * 24 } },
    );
    if (!summaryRes.ok) return null;
    const summary: SummaryResponse = await summaryRes.json();

    return {
      title: summary.title,
      extract: summary.extract,
      thumbnailUrl: summary.thumbnail?.source ?? null,
      pageUrl: summary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    };
  } catch {
    return null;
  }
}
