#!/usr/bin/env node
/**
 * Refuse to publish something that should not be public.
 *
 * Wired to `prepublishOnly`, so npm runs it on every `npm publish` and there is no path around it
 * that does not involve deliberately editing this file. It is deliberately **not** a preflight
 * stage: publishing is rare, pushing is constant, and a missing licence should stop a release
 * rather than stop everyone's work.
 *
 * The licence check is the one that matters. This package was `private: true` from the first
 * commit, so nothing ever validated it as a public artefact, and the repo has no LICENCE file at
 * all. Publishing without one does not mean "free to use": it means no permission is granted, so
 * every merchant who installs it is technically in breach. That is a worse outcome than not
 * shipping, and it is the kind of thing nobody notices until a customer's legal team does.
 */
import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const PKG = resolve(HERE, "..");
const ROOT = resolve(PKG, "../..");

const pkg = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8"));
const problems = [];

if (pkg.private === true) {
  problems.push("package.json still has `private: true`, so npm will refuse anyway.");
}

if (pkg.name.startsWith("@pulse/")) {
  problems.push(
    "the @pulse scope on npm belongs to someone else. This package cannot publish under it; " +
      "@thepulseapi is the scope that was free.",
  );
}

if (!pkg.license) {
  problems.push(
    "no `license` field. A public package with no licence grants nobody permission to use it, " +
      "which is the opposite of what shipping an SDK is for. Decide the licence, add the field, " +
      "and put the matching LICENSE file at the repo root.",
  );
}

/*
 * The package's own LICENSE, not the repo root's.
 *
 * npm only packs a LICENSE that sits in the package directory, so in a monorepo a root-only
 * licence satisfies every human reading the repo and ships nothing. The tarball a merchant
 * installs would declare "MIT" in its manifest and carry no grant.
 */
if (pkg.license && !existsSync(join(PKG, "LICENSE"))) {
  problems.push(
    `package.json declares "${pkg.license}" but packages/sdk/LICENSE does not exist. npm only ` +
      "packs a LICENSE from the package directory, so a root-only one never reaches the tarball. " +
      "The field is a claim; the file is the grant.",
  );
}

if (!existsSync(join(ROOT, "LICENSE"))) {
  problems.push("the repo root has no LICENSE. The package copy should match it, not replace it.");
}

if (!existsSync(join(PKG, "README.md"))) {
  problems.push("no README.md. That is the entire npm landing page.");
}

/* `files` is an allowlist. Getting it wrong publishes src, or publishes nothing. */
for (const needed of ["dist", "README.md"]) {
  if (!pkg.files?.includes(needed)) problems.push(`\`files\` does not include ${needed}.`);
}

if (!existsSync(join(PKG, "dist/index.iife.js"))) {
  problems.push("dist/ is not built. Run the build before publishing.");
}

/*
 * The README hands merchants a `<script>` tag with an `integrity` attribute and a pinned version.
 * Both go stale silently: a version bump leaves the old path in the docs, and any source change
 * leaves the old hash. A wrong SRI hash is not a typo, it is a blocked script on every storefront
 * that copied the snippet, and the browser console message blames the merchant's own CSP setup.
 */
if (existsSync(join(PKG, "dist/index.iife.js")) && existsSync(join(PKG, "README.md"))) {
  const readme = readFileSync(join(PKG, "README.md"), "utf8");
  const bytes = readFileSync(join(PKG, "dist/index.iife.js"));
  const sri = `sha384-${createHash("sha384").update(bytes).digest("base64")}`;

  if (readme.includes("integrity=") && !readme.includes(sri)) {
    problems.push(
      `the README pins an integrity hash that does not match dist/index.iife.js. ` +
        `It should be ${sri}. A wrong SRI hash blocks the script on every storefront that copied it.`,
    );
  }
  const pinned = readme.match(/\/sdk\/v(\d+\.\d+\.\d+)\//);
  if (pinned && pinned[1] !== pkg.version) {
    problems.push(
      `the README pins the CDN path /sdk/v${pinned[1]}/ but this package is ${pkg.version}.`,
    );
  }
}

/* A publishable package must not depend on a workspace sibling: `workspace:*` does not resolve for anyone outside this repo. */
for (const field of ["dependencies", "peerDependencies"]) {
  for (const [name, range] of Object.entries(pkg[field] ?? {})) {
    if (String(range).startsWith("workspace:")) {
      problems.push(`${field}.${name} is "${range}", which no consumer outside this repo can resolve.`);
    }
  }
}

if (problems.length > 0) {
  console.error("@thepulseapi/sdk is not publishable:\n  - " + problems.join("\n  - "));
  process.exit(1);
}
console.log("@thepulseapi/sdk publishable — licence, readme, files and dist all present");
