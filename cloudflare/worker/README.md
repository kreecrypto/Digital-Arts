# Digital Arts — Cloudflare R2 + Worker Sync

Target pipeline:

`Google Drive → Google Sheet → Cloudflare Worker + Images → R2 → Vercel`

Google Drive remains the master source for artwork/product files. Google Sheet is the catalog and release source of truth. The Worker reads release status plus website metadata from the Sheet, transcodes approved website artwork to WebP with the Cloudflare Images binding, stores the resulting bytes in R2, and generates `catalog/catalog.json` for the Next.js site.

## Release gate

A product is published only when all three checks pass:

1. `File Index.Status = COMPLETE`
2. `Task Queue.Status = COMPLETE`
3. `Task Queue.QA / Gate` contains `PASS`

Rows also need `File Index.Catalog Type = PRODUCT` before they can enter the website catalog.

Website artwork is mirrored only when:

1. `File Index.Catalog Type = ARTWORK`
2. `File Index.Status = WEBSITE READY`
3. `Artwork Key` is present
4. `CDN Format = webp`

The Worker validates product `Image Key` references against the artwork generated during the same sync. A broken image mapping blocks catalog publication instead of creating a partially broken catalog.

## Sheet-owned website fields

`File Index` now owns these fields:

- `Catalog Type` — `PRODUCT` or `ARTWORK`
- `Web Slug`
- `Web Meta`
- `Web Detail`
- `Image Key`
- `Artwork Key`
- `CDN Format`

Product rows use `Web Slug / Web Meta / Web Detail / Image Key`.
Artwork rows use `Artwork Key / CDN Format`.

There is no product metadata registry or artwork-ID registry inside the Worker anymore.

## WebP pipeline

The Drive master can remain PNG. During `/sync`, the Worker passes the original image bytes to the Cloudflare Images binding and outputs real `image/webp` bytes before writing to R2.

Resulting R2 keys are:

- `media/hero.webp`
- `media/rabbit.webp`
- `media/fox.webp`
- `media/owl.webp`

The original Drive files remain unchanged and continue to be the master assets.

## Worker endpoints

- `GET /health` — health check
- `POST /sync` — protected catalog/media sync
- `GET /catalog.json` — public website catalog
- `GET /media/:key` — cacheable R2 media delivery

## Cloudflare setup

1. Create an R2 bucket named `digital-arts-artwork`.
2. Enable the Cloudflare Images binding for the Worker as `IMAGES`.
3. Copy `wrangler.toml.example` to `wrangler.toml`.
4. Create a Google Cloud service account with read-only Sheets + Drive access.
5. Share the production Google Sheet and approved website artwork with the service-account email as Viewer.
6. Configure Worker secrets:
   - `SYNC_TOKEN`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
7. Deploy the Worker.
8. Run `POST /sync` with `Authorization: Bearer <SYNC_TOKEN>`.
9. Verify `GET /catalog.json` returns the approved products and `.webp` R2 media URLs.
10. Add the Vercel environment variable:
    - `CLOUDFLARE_CATALOG_URL=https://<worker-host>/catalog.json`
11. Redeploy Vercel. The site will automatically stop using `local-fallback` when the Worker catalog becomes reachable.

## Failure behavior

The sync fails closed when required Sheet metadata, Drive IDs, Images/R2 bindings, or product-to-artwork mappings are missing. The previously generated R2 catalog remains untouched when a sync fails before the catalog write.

The Next.js site continues to use the current local catalog/artwork as a temporary migration fallback when `CLOUDFLARE_CATALOG_URL` is missing, unreachable, or invalid. Once the Cloudflare pipeline is live and verified, that fallback can be removed in a separate cleanup.

## Current production Sheet

Spreadsheet ID:

`1C6qhwnDCVU_4Thp8wDA86qXHTNhkzgOEpLHl-3jg_j8`

Tabs:

- `File Index`
- `Task Queue`
