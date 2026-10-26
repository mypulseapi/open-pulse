#!/usr/bin/env node
/**
 * Put the script-tag build on the CDN, which is where every storefront integration gets it.
 *
 *   node scripts/publish-cdn.mjs --dry-run     # print the plan, touch nothing
 *   node scripts/publish-cdn.mjs               # upload
 *
 * **Why this exists.** WordPress, Shopify, Alpine, Astro and Laravel integrations are all script
 * tags, so the bundle has to be on the CDN, not only on npm.
 *
 * **Two paths, on purpose.**
 *
 *   sdk/v0.1.3/pulse.iife.js   exact, immutable, cached for a year
 *   sdk/v0/pulse.iife.js       floating major, cached for five minutes
 *
 * The exact path is what a Subresource Integrity hash can be published against, because its bytes
 * never change. The floating one is what the quick-start shows, so a patch reaches merchants who
 * copied a snippet once and will never touch it again. A long cache on the floating path would
 * make that promise a lie, which is why the two differ.
 *
 * Cloudflare R2 speaks S3, hence the S3 client. Only maintainers with CDN credentials can run it.
 */
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG = resolve(HERE, "..");
const DIST = join(PKG, "dist");

const DRY = process.argv.includes("--dry-run");

/*
 * CDN credentials from the shell, or from a gitignored `.env` at the repo root. Only `CDN_STORAGE_*`
 * is read from the file, and a shell variable is never overridden.
 */
const ROOT_ENV = resolve(PKG, "../../.env");
if (existsSync(ROOT_ENV)) {
  for (const [k, v] of Object.entries(parseEnv(readFileSync(ROOT_ENV, "utf8")))) {
    if (k.startsWith("CDN_STORAGE_") && process.env[k] === undefined) process.env[k] = v;
  }
}

const { version } = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8"));
const major = `v${version.split(".")[0]}`;

/** The file merchants load. The source map rides along so a stack trace from a storefront is readable. */
const ARTEFACTS = [
  { local: "index.iife.js", remote: "pulse.iife.js", type: "application/javascript; charset=utf-8" },
  { local: "index.iife.js.map", remote: "pulse.iife.js.map", type: "application/json; charset=utf-8" },
];

const missing = ARTEFACTS.filter((a) => !existsSync(join(DIST, a.local)));
if (missing.length > 0) {
  console.error(
    `publish-cdn: ${missing.map((m) => m.local).join(", ")} missing from dist/.\n` +
      "  Run `pnpm --filter @thepulseapi/sdk build` first.",
  );
  process.exit(1);
}

/**
 * Subresource Integrity, sha384, the algorithm browsers expect in an `integrity` attribute.
 * Printed rather than uploaded: it belongs in the docs beside the snippet it protects.
 */
const sri = (buf) => `sha384-${createHash("sha384").update(buf).digest("base64")}`;

/** A year for the immutable path, five minutes for the floating one. */
const YEAR = "public, max-age=31536000, immutable";
const SHORT = "public, max-age=300";

const plan = [];
for (const a of ARTEFACTS) {
  const body = readFileSync(join(DIST, a.local));
  plan.push({ key: `sdk/v${version}/${a.remote}`, body, type: a.type, cache: YEAR });
  plan.push({ key: `sdk/${major}/${a.remote}`, body, type: a.type, cache: SHORT });
}

const iife = readFileSync(join(DIST, "index.iife.js"));
console.log(`@thepulseapi/sdk ${version}`);
console.log(`  bundle    ${(iife.length / 1024).toFixed(1)} KB`);
console.log(`  integrity ${sri(iife)}`);
console.log("");
for (const p of plan) {
  console.log(`  ${DRY ? "would upload" : "upload"}  ${p.key.padEnd(34)} ${String(p.cache).split(",")[1].trim()}`);
}

if (DRY) {
  console.log("\ndry run, nothing uploaded.");
  process.exit(0);
}

/*
 * Storage config, provider-neutral.
 *
 * Precedence: CDN_STORAGE_*, then STORAGE_*, then the older AWS_* and R2_* names.
 */
const pick = (...names) => {
  for (const n of names) {
    const v = process.env[n];
    if (v) return v;
  }
  return undefined;
};

const endpoint =
  pick("CDN_STORAGE_ENDPOINT", "STORAGE_ENDPOINT", "AWS_S3_ENDPOINT") ??
  (process.env.R2_ACCOUNT_ID
    ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : undefined);
const accessKeyId = pick(
  "CDN_STORAGE_ACCESS_KEY_ID",
  "STORAGE_ACCESS_KEY_ID",
  "AWS_ACCESS_KEY_ID",
  "R2_ACCESS_KEY_ID",
);
const secretAccessKey = pick(
  "CDN_STORAGE_SECRET_ACCESS_KEY",
  "STORAGE_SECRET_ACCESS_KEY",
  "AWS_SECRET_ACCESS_KEY",
  "R2_SECRET_ACCESS_KEY",
);
const Bucket = pick("CDN_STORAGE_BUCKET", "STORAGE_BUCKET", "AWS_S3_BUCKET", "R2_BUCKET_NAME");

if (!endpoint || !accessKeyId || !secretAccessKey || !Bucket) {
  console.error(
    "\npublish-cdn: missing storage credentials.\n" +
      "  Set CDN_STORAGE_ENDPOINT, CDN_STORAGE_ACCESS_KEY_ID, CDN_STORAGE_SECRET_ACCESS_KEY and\n" +
      "  CDN_STORAGE_BUCKET in the repo-root .env, or STORAGE_* (or the old AWS_*, R2_*) in the\n" +
      "  shell. Nothing was uploaded.",
  );
  process.exit(1);
}

const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "auto",
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
});

for (const p of plan) {
  await s3.send(
    new PutObjectCommand({
      Bucket,
      Key: p.key,
      Body: p.body,
      ContentType: p.type,
      CacheControl: p.cache,
    }),
  );
  console.log(`  ok  ${p.key}`);
}

console.log(`\nLive at https://cdn.thepulseapi.com/sdk/${major}/pulse.iife.js`);
