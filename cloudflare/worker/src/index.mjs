const PRODUCT_DEFAULTS = {
  "ETSY-03": {
    slug: "woodland-scissor-skills",
    meta: "13 pages · A4 + US Letter",
    detail: "12 progressive cutting activities for ages 3–5.",
    imageKey: "rabbit",
  },
  "ETSY-04": {
    slug: "woodland-alphabet-a-z",
    meta: "27 pages per format",
    detail: "A–Z learning set using the approved woodland asset library.",
    imageKey: "fox",
  },
  "ETSY-05": {
    slug: "woodland-matching-game",
    meta: "12 pairs · 24 cards",
    detail: "Three-page matching game in A4 and US Letter.",
    imageKey: "owl",
  },
};

const ARTWORK_KEYS = {
  "WEB-ART-01": "hero",
  "WEB-ART-02": "rabbit",
  "WEB-ART-03": "fox",
  "WEB-ART-04": "owl",
};

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "public, max-age=60, s-maxage=300",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return Response.json({ ok: true, service: "digital-arts-sync" });
    }

    if (request.method === "GET" && url.pathname === "/catalog.json") {
      const object = await env.ARTWORK_BUCKET.get("catalog/catalog.json");
      if (!object) {
        return Response.json(
          { ok: false, error: "catalog_not_synced" },
          { status: 404, headers: JSON_HEADERS },
        );
      }
      return new Response(object.body, { headers: JSON_HEADERS });
    }

    if (request.method === "GET" && url.pathname.startsWith("/media/")) {
      const key = decodeURIComponent(url.pathname.slice("/media/".length));
      if (!key || key.includes("..")) return new Response("Bad request", { status: 400 });

      const object = await env.ARTWORK_BUCKET.get(`media/${key}`);
      if (!object) return new Response("Not found", { status: 404 });

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      headers.set("cache-control", "public, max-age=31536000, immutable");
      return new Response(object.body, { headers });
    }

    if (request.method === "POST" && url.pathname === "/sync") {
      const auth = request.headers.get("authorization");
      if (!env.SYNC_TOKEN || auth !== `Bearer ${env.SYNC_TOKEN}`) {
        return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
      }

      try {
        const result = await syncProductionCatalog(request, env);
        return Response.json({ ok: true, ...result });
      } catch (error) {
        console.error("sync failed", error);
        return Response.json(
          { ok: false, error: error instanceof Error ? error.message : "sync_failed" },
          { status: 500 },
        );
      }
    }

    return new Response("Digital Arts sync worker", { status: 200 });
  },
};

async function syncProductionCatalog(request, env) {
  assertEnv(env, [
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_PRIVATE_KEY",
    "SPREADSHEET_ID",
    "SYNC_TOKEN",
  ]);

  const token = await getGoogleAccessToken(env);
  const [fileIndexRows, taskQueueRows] = await readSheetTabs(env.SPREADSHEET_ID, token);

  const fileIndex = rowsToObjects(fileIndexRows, 6);
  const taskQueue = rowsToObjects(taskQueueRows, 2);
  const tasksById = new Map(taskQueue.map((row) => [row["Task ID"], row]));

  const origin = new URL(request.url).origin;
  const artwork = {};
  const media = [];

  for (const row of fileIndex) {
    const taskId = row["Task ID"];
    const artworkKey = ARTWORK_KEYS[taskId];
    if (!artworkKey || normalize(row.Status) !== "WEBSITE READY") continue;

    const driveId = extractDriveId(row["Drive Link"] || "");
    if (!driveId) continue;

    const driveResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${driveId}?alt=media`,
      { headers: { authorization: `Bearer ${token}` } },
    );
    if (!driveResponse.ok) {
      throw new Error(`Drive download failed for ${taskId}: ${driveResponse.status}`);
    }

    const contentType = driveResponse.headers.get("content-type") || "image/png";
    const extension = extensionForContentType(contentType);
    const mediaKey = `${artworkKey}.${extension}`;
    const body = await driveResponse.arrayBuffer();

    await env.ARTWORK_BUCKET.put(`media/${mediaKey}`, body, {
      httpMetadata: { contentType },
      customMetadata: { sourceTaskId: taskId, sourceDriveId: driveId },
    });

    artwork[artworkKey] = `${origin}/media/${encodeURIComponent(mediaKey)}`;
    media.push({ taskId, key: artworkKey, r2Key: `media/${mediaKey}`, contentType });
  }

  const products = [];
  for (const row of fileIndex) {
    const taskId = row["Task ID"];
    const defaults = PRODUCT_DEFAULTS[taskId];
    if (!defaults) continue;

    const task = tasksById.get(taskId);
    const fileReady = normalize(row.Status) === "COMPLETE";
    const taskReady = normalize(task?.Status) === "COMPLETE";
    const qaPass = /\bPASS\b/i.test(task?.["QA / Gate"] || "");

    if (!(fileReady && taskReady && qaPass)) continue;

    products.push({
      id: taskId,
      slug: defaults.slug,
      title: stripFinalSuffix(row.Artifact || task?.Task || taskId),
      meta: defaults.meta,
      detail: defaults.detail,
      status: "QA PASS",
      imageKey: defaults.imageKey,
      sourceDriveUrl: row["Drive Link"] || null,
    });
  }

  const payload = {
    schemaVersion: 1,
    source: "google-drive-sheet-cloudflare-r2",
    syncedAt: new Date().toISOString(),
    spreadsheetId: env.SPREADSHEET_ID,
    releaseGate: "File Index COMPLETE + Task Queue COMPLETE + QA/Gate contains PASS",
    artwork,
    products,
  };

  await env.ARTWORK_BUCKET.put(
    "catalog/catalog.json",
    JSON.stringify(payload, null, 2),
    { httpMetadata: { contentType: "application/json; charset=utf-8" } },
  );

  return {
    syncedAt: payload.syncedAt,
    artworkCount: Object.keys(artwork).length,
    productCount: products.length,
    media,
  };
}

function assertEnv(env, keys) {
  const missing = keys.filter((key) => !env[key]);
  if (missing.length) throw new Error(`Missing Worker secrets/vars: ${missing.join(", ")}`);
}

async function readSheetTabs(spreadsheetId, token) {
  const ranges = ["File Index!A1:Z1000", "Task Queue!A1:Z1000"];
  const params = new URLSearchParams();
  for (const range of ranges) params.append("ranges", range);
  params.set("majorDimension", "ROWS");

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${params}`,
    { headers: { authorization: `Bearer ${token}` } },
  );
  if (!response.ok) throw new Error(`Google Sheets read failed: ${response.status}`);

  const json = await response.json();
  return [
    json.valueRanges?.[0]?.values || [],
    json.valueRanges?.[1]?.values || [],
  ];
}

function rowsToObjects(rows, headerIndex) {
  const header = rows[headerIndex] || [];
  return rows.slice(headerIndex + 1).map((values) => {
    const row = {};
    header.forEach((key, index) => {
      if (key) row[key] = values[index] ?? "";
    });
    return row;
  });
}

function normalize(value) {
  return String(value || "").trim().toUpperCase();
}

function stripFinalSuffix(value) {
  return String(value).replace(/\s+FINAL$/i, "").trim();
}

function extractDriveId(url) {
  const value = String(url || "");
  const fileMatch = value.match(/\/file\/d\/([^/]+)/);
  if (fileMatch) return fileMatch[1];
  const openMatch = value.match(/[?&]id=([^&]+)/);
  if (openMatch) return openMatch[1];
  return null;
}

function extensionForContentType(contentType) {
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  return "png";
}

async function getGoogleAccessToken(env) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(JSON.stringify({
    iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/drive.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));

  const unsigned = `${header}.${claims}`;
  const key = await importPrivateKey(env.GOOGLE_PRIVATE_KEY);
  const signature = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    key,
    new TextEncoder().encode(unsigned),
  );
  const assertion = `${unsigned}.${base64UrlBytes(new Uint8Array(signature))}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!response.ok) throw new Error(`Google OAuth failed: ${response.status}`);

  const json = await response.json();
  if (!json.access_token) throw new Error("Google OAuth returned no access token");
  return json.access_token;
}

async function importPrivateKey(pem) {
  const normalized = String(pem).replace(/\\n/g, "\n");
  const base64 = normalized
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const raw = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  return crypto.subtle.importKey(
    "pkcs8",
    raw,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

function base64Url(value) {
  return base64UrlBytes(new TextEncoder().encode(value));
}

function base64UrlBytes(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
