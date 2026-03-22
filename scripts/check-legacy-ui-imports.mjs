/**
 * Grep-style guardrail: fail if feature code imports legacy ui/* bridges
 * (mirrors ESLint no-restricted-imports; useful in CI or pre-commit).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = join(__dirname, "..", "src");

const LEGACY_RE =
  /from\s+["']((?:\.\.\/)+)ui\/(Button|Badge|Input|Dialog|Tabs|Tooltip|EmptyState|DropdownMenu|Splitter|Section|FieldRow)["']/g;

const BRIDGE_BASENAMES = new Set([
  "Button.tsx",
  "Badge.tsx",
  "Input.tsx",
  "Dialog.tsx",
  "Tabs.tsx",
  "Tooltip.tsx",
  "EmptyState.tsx",
  "DropdownMenu.tsx",
  "Splitter.tsx",
  "Section.tsx",
  "FieldRow.tsx",
]);

function isBridgeFile(absPath) {
  const rel = relative(SRC_ROOT, absPath).replace(/\\/g, "/");
  return /^ui\/[^/]+\.tsx$/.test(rel) && BRIDGE_BASENAMES.has(rel.split("/").pop());
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(tsx|ts)$/.test(name)) out.push(p);
  }
  return out;
}

const violations = [];
for (const file of walk(SRC_ROOT)) {
  if (isBridgeFile(file)) continue;
  const text = readFileSync(file, "utf8");
  LEGACY_RE.lastIndex = 0;
  let m;
  while ((m = LEGACY_RE.exec(text)) !== null) {
    violations.push({ file, spec: m[0] });
  }
}

if (violations.length > 0) {
  console.error("Legacy UI bridge imports found (use ../ui/kit or ../ui/canonical):\n");
  for (const v of violations) {
    console.error(`  ${relative(join(__dirname, ".."), v.file)}: ${v.spec.trim()}`);
  }
  process.exit(1);
}

console.log("check-legacy-ui-imports: OK");
