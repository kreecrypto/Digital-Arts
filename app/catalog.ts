export type ArtworkKey = "hero" | "rabbit" | "fox" | "owl";

export type Product = {
  id: string;
  slug?: string;
  title: string;
  meta: string;
  detail: string;
  status: string;
  imageKey: Exclude<ArtworkKey, "hero">;
  sourceDriveUrl?: string | null;
};

export type CatalogPayload = {
  schemaVersion: number;
  source: string;
  syncedAt: string;
  releaseGate?: string;
  artwork: Partial<Record<ArtworkKey, string>>;
  products: Product[];
};

const fallbackCatalog: CatalogPayload = {
  schemaVersion: 1,
  source: "local-fallback",
  syncedAt: "2026-09-07T00:00:00.000Z",
  artwork: {},
  products: [
    {
      id: "ETSY-03",
      slug: "woodland-scissor-skills",
      title: "Woodland Scissor Skills",
      meta: "13 pages · A4 + US Letter",
      detail: "12 progressive cutting activities for ages 3–5.",
      status: "QA PASS",
      imageKey: "rabbit",
    },
    {
      id: "ETSY-04",
      slug: "woodland-alphabet-a-z",
      title: "Woodland Alphabet A–Z",
      meta: "27 pages per format",
      detail: "A–Z learning set using the approved woodland asset library.",
      status: "QA PASS",
      imageKey: "fox",
    },
    {
      id: "ETSY-05",
      slug: "woodland-matching-game",
      title: "Woodland Matching Game",
      meta: "12 pairs · 24 cards",
      detail: "Three-page matching game in A4 and US Letter.",
      status: "QA PASS",
      imageKey: "owl",
    },
  ],
};

export async function getCatalog(): Promise<CatalogPayload> {
  const catalogUrl = process.env.CLOUDFLARE_CATALOG_URL;
  if (!catalogUrl) return fallbackCatalog;

  try {
    const response = await fetch(catalogUrl, { next: { revalidate: 300 } });
    if (!response.ok) throw new Error(`catalog fetch failed: ${response.status}`);

    const remote = (await response.json()) as Partial<CatalogPayload>;
    if (!Array.isArray(remote.products)) throw new Error("catalog products are invalid");

    return {
      schemaVersion: remote.schemaVersion ?? 1,
      source: remote.source ?? "cloudflare-worker",
      syncedAt: remote.syncedAt ?? new Date(0).toISOString(),
      releaseGate: remote.releaseGate,
      artwork: remote.artwork ?? {},
      products: remote.products,
    };
  } catch {
    return fallbackCatalog;
  }
}
