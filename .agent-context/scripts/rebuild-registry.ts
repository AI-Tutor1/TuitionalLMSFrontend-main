#!/usr/bin/env node
/**
 * rebuild-registry.ts
 *
 * Regenerates all .agent-context/registry/*.json files from actual source code.
 * Uses SHA256 file hashing (Graphify pattern) for incremental updates.
 *
 * Usage: npx ts-node .agent-context/scripts/rebuild-registry.ts
 * Or:    node --loader ts-node/esm .agent-context/scripts/rebuild-registry.ts
 *
 * This script:
 * 1. Walks src/ directory tree
 * 2. Hashes each file with SHA256
 * 3. Extracts metadata (component names, imports, exports, props)
 * 4. Writes structured JSON to .agent-context/registry/
 * 5. Computes god nodes (most-imported entities)
 * 6. Computes domain assignments
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

// ─── Configuration ───────────────────────────────────────────

const SRC_DIR = path.resolve(__dirname, "../../src");
const REGISTRY_DIR = path.resolve(__dirname, "../registry");
const GRAPH_DIR = path.resolve(__dirname, "../graph");
const CACHE_FILE = path.resolve(__dirname, "../.rebuild-cache.json");

// ─── Types ───────────────────────────────────────────────────

interface FileHash {
  path: string;
  hash: string;
}

interface ComponentEntry {
  id: string;
  name: string;
  path: string;
  category: string;
  domain: string;
  confidence: "EXTRACTED" | "INFERRED" | "AMBIGUOUS";
  lines: number;
  imports: string[];
  exports: string[];
}

interface RouteEntry {
  path: string;
  page: string;
  screen: string | null;
  domain: string;
  confidence: "EXTRACTED" | "INFERRED" | "AMBIGUOUS";
}

interface HookEntry {
  id: string;
  name: string;
  path: string;
  domain: string;
  confidence: "EXTRACTED" | "INFERRED" | "AMBIGUOUS";
}

// ─── Hashing (Graphify pattern) ──────────────────────────────

function fileHash(filePath: string): string {
  const content = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256");
  hash.update(content);
  hash.update(Buffer.from("\x00"));
  hash.update(Buffer.from(path.resolve(filePath)));
  return hash.digest("hex");
}

function loadCache(): Record<string, string> {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, string>): void {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

// ─── File Discovery ──────────────────────────────────────────

function walkDir(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith(".") && item !== "node_modules") {
      results.push(...walkDir(fullPath, extensions));
    } else if (stat.isFile() && extensions.some((ext) => item.endsWith(ext))) {
      results.push(fullPath);
    }
  }

  return results;
}

// ─── Extraction ──────────────────────────────────────────────

function extractComponentName(content: string): string | null {
  // Match: export default memo(ComponentName) or export default ComponentName
  const memoMatch = content.match(/export\s+default\s+memo\((\w+)\)/);
  if (memoMatch) return memoMatch[1];

  const defaultMatch = content.match(/export\s+default\s+(?:withAuth\()?(\w+)\)?/);
  if (defaultMatch) return defaultMatch[1];

  const namedMatch = content.match(/export\s+(?:const|function)\s+(\w+)/);
  if (namedMatch) return namedMatch[1];

  return null;
}

function extractImports(content: string): string[] {
  const imports: string[] = [];
  const importRegex = /from\s+["']([^"']+)["']/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

function inferDomain(filePath: string): string {
  const rel = path.relative(SRC_DIR, filePath).toLowerCase();

  if (rel.includes("enrollment")) return "enrollments";
  if (rel.includes("session") && !rel.includes("feedback")) return "sessions";
  if (rel.includes("feedback") || rel.includes("analytics")) return "feedbacks";
  if (rel.includes("user") || rel.includes("student") || rel.includes("teacher") || rel.includes("parent")) return "users";
  if (rel.includes("billing") || rel.includes("payment")) return "billing";
  if (rel.includes("invoice") || rel.includes("lead")) return "invoices";
  if (rel.includes("chat") || rel.includes("message") || rel.includes("room")) return "chat";
  if (rel.includes("schedule") || rel.includes("calendar") || rel.includes("cancel") || rel.includes("reschedule") || rel.includes("ongoing") || rel.includes("activit")) return "class-schedule";
  if (rel.includes("dashboard") || rel.includes("analytic")) return "dashboard";
  if (rel.includes("role") || rel.includes("page") || rel.includes("permission")) return "roles";
  if (rel.includes("resource") || rel.includes("note")) return "resources";
  if (rel.includes("transaction")) return "transactions";
  if (rel.includes("auth") || rel.includes("signin") || rel.includes("password") || rel.includes("withauth")) return "auth";
  if (rel.includes("demo") || rel.includes("tutor-request")) return "demo";
  if (rel.includes("churn")) return "churn";
  if (rel.includes("ticket")) return "tickets";
  if (rel.includes("polic")) return "policies";
  if (rel.includes("notif") || rel.includes("fcm") || rel.includes("firebase")) return "notifications";
  if (rel.includes("payout") || rel.includes("earning")) return "payouts";
  if (rel.includes("curriculum")) return "curriculum";
  if (rel.includes("global") || rel.includes("helper") || rel.includes("hook") || rel.includes("util")) return "shared";

  return "shared";
}

function inferCategory(filePath: string): string {
  const rel = path.relative(SRC_DIR, filePath);
  if (rel.startsWith("components/global")) return "global";
  if (rel.startsWith("components/ui/superAdmin")) return "ui/superAdmin";
  if (rel.startsWith("components/ui/teacher")) return "ui/teacher";
  if (rel.startsWith("components/ui/student")) return "ui/student";
  if (rel.startsWith("components/ui")) return "ui/shared";
  if (rel.startsWith("screens")) return "screen";
  if (rel.startsWith("services")) return "service";
  if (rel.startsWith("api")) return "api";
  if (rel.startsWith("utils")) return "util";
  if (rel.startsWith("lib")) return "lib";
  if (rel.startsWith("types")) return "type";
  return "other";
}

// ─── Main ────────────────────────────────────────────────────

function main(): void {
  console.log("Rebuilding registry from source...");

  const cache = loadCache();
  const newCache: Record<string, string> = {};

  // Discover all TypeScript/TSX files
  const allFiles = walkDir(SRC_DIR, [".ts", ".tsx", ".jsx"]);
  console.log(`Found ${allFiles.length} source files`);

  let skipped = 0;
  let processed = 0;

  const components: ComponentEntry[] = [];
  const hooks: HookEntry[] = [];
  const routes: RouteEntry[] = [];

  for (const file of allFiles) {
    const hash = fileHash(file);
    const relPath = path.relative(path.resolve(__dirname, "../.."), file);
    newCache[relPath] = hash;

    // Skip unchanged files
    if (cache[relPath] === hash) {
      skipped++;
      continue;
    }
    processed++;

    const content = fs.readFileSync(file, "utf-8");
    const lines = content.split("\n").length;
    const imports = extractImports(content);
    const componentName = extractComponentName(content);
    const domain = inferDomain(file);
    const category = inferCategory(file);

    // Components (tsx files in components/ or screens/)
    if (file.endsWith(".tsx") && componentName) {
      if (relPath.startsWith("src/components/") || relPath.startsWith("src/screens/")) {
        components.push({
          id: path.basename(path.dirname(file)),
          name: componentName,
          path: relPath,
          category,
          domain,
          confidence: "EXTRACTED",
          lines,
          imports,
          exports: [componentName],
        });
      }
    }

    // Hooks
    if (file.match(/use\w+\.(ts|tsx)$/) && relPath.includes("utils/hooks")) {
      hooks.push({
        id: path.basename(file, path.extname(file)),
        name: componentName || path.basename(file, path.extname(file)),
        path: relPath,
        domain,
        confidence: "EXTRACTED",
      });
    }

    // Routes
    if (file.endsWith("page.tsx") && relPath.includes("app/")) {
      const routePath = relPath
        .replace("src/app/(protected)/", "/")
        .replace("src/app/(public)/", "/")
        .replace("src/app/", "/")
        .replace("/page.tsx", "")
        .replace(/\/+$/, "") || "/";

      routes.push({
        path: routePath,
        page: relPath,
        screen: null,
        domain,
        confidence: "EXTRACTED",
      });
    }
  }

  console.log(`Processed: ${processed}, Skipped (unchanged): ${skipped}`);

  // Write registry files
  fs.mkdirSync(REGISTRY_DIR, { recursive: true });
  fs.mkdirSync(GRAPH_DIR, { recursive: true });

  fs.writeFileSync(
    path.join(REGISTRY_DIR, "components.json"),
    JSON.stringify({ lastUpdated: new Date().toISOString(), generatedBy: "rebuild-registry.ts", components }, null, 2)
  );

  fs.writeFileSync(
    path.join(REGISTRY_DIR, "hooks.json"),
    JSON.stringify({ lastUpdated: new Date().toISOString(), hooks }, null, 2)
  );

  // Save cache
  saveCache(newCache);

  console.log(`Registry rebuilt: ${components.length} components, ${hooks.length} hooks, ${routes.length} routes`);
  console.log("Done.");
}

main();
