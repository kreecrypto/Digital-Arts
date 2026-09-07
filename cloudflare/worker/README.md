# Digital Arts — Cloudflare R2 + Worker Sync

Target pipeline:

`Google Drive → Google Sheet → Cloudflare Worker → R2 → Vercel`

Google Drive remains the master source of truth for artwork/product files. Google Sheet owns release status. The Worker reads both release tabs, blocks inconsistent products, mirrors approved website artwork into R2, and writes a generated `catalog/catalog.json` object for the Next.js site.

## Release gate

A product is published only when all three checks pass:

1. `File Index.Status = COMPLETE`
2. `Task Queue.Status = COMPLETE`
3. `Task Queue.QA / Gate` contains `PASS`

This intentionally excludes conflicting rows such as a Task Queue item that says COMPLETE while File Index still points to a prototype/upload-pending artifact.

Website artwork is mirrored only when `File Index.Status = WEBSITE READY` and Task ID matches the approved web artwork registry (`WEB-ART-01` … `WEB-ART-04`).

## Worker endpoints

- `GET /health` — health check
- `POST /sync` — protected catalog/media sync
- `GET /catalog.json` — public website catalog
- `GET /media/:key` — cacheable R2 media delivery

## Cloudflare setup

1. Create an R2 bucket named `digital-arts-artwork`.
2. Copy `wrangler.toml.example` to `wrangler.toml`.
3. Create a Google Cloud service account with read-only Sheets + Drive access.
4. Share the production Google Sheet and the approved website-artwork Drive files/folder with the service-account email as Viewer.
5. Configure Worker secrets:
   - `SYNC_TOKEN`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`
6. Deploy the Worker.
7. Run the first sync with `POST /sync` and `Authorization: Bearer <SYNC_TOKEN>`.
8. Verify `GET /catalog.json` returns approved products and R2 artwork URLs.
9. Add Vercel environment variable:
   - `CLOUDFLARE_CATALOG_URL=https://<worker-host>/catalog.json`
10. Redeploy Vercel. The site will automatically stop using `local-fallback` when the Worker catalog becomes reachable.

## WebP note

The current Worker preserves the source image MIME type when copying from Drive into R2. Existing website masters are PNG, so the first R2 sync will remain PNG. To enforce **WebP stored in R2**, choose one of these production paths:

- Preferred: generate approved WebP preview assets upstream and store those preview files in Drive; point `WEB-ART-*` rows to the WebP previews.
- Alternative: add Cloudflare image transformation/Images before the R2 write once that service is enabled for the account.

Do not label R2 objects as WebP unless the bytes are actually WebP.

## Failure behavior

The Next.js site uses the current local catalog/artwork as a safe fallback when `CLOUDFLARE_CATALOG_URL` is missing, unreachable, or invalid. This lets the Cloudflare migration be deployed incrementally without breaking Production.

## Current production Sheet

Spreadsheet ID:

`1C6qhwnDCVU_4Thp8wDA86qXHTNhkzgOEpLHl-3jg_j8`

Tabs:

- `File Index`
- `Task Queue`
