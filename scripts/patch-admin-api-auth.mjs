import fs from "fs";
import path from "path";

const adminApiDir = "src/app/api/admin";
const fullAdminSegments = new Set([
  "newsletters",
  "promo-codes",
  "plans",
  "users",
  "settings",
  "categories",
  "locations",
  "campaigns",
  "content",
  "reports",
  "stripe",
]);

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".ts")) patchFile(p);
  }
}

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;

  content = content.replace(/requireAdminApi\(\)/g, "requireAdminApi(request)");

  const rel = filePath.replace(/\\/g, "/");
  const isReservedEmails = rel.includes("settings/reserved-emails");
  const segment = rel.match(/\/api\/admin\/([^/]+)/)?.[1];
  const useFullAdmin =
    segment && fullAdminSegments.has(segment) && !isReservedEmails;

  if (useFullAdmin) {
    if (!content.includes("requireFullAdminApi")) {
      content = content.replace(
        'from "@/lib/admin-utils"',
        'from "@/lib/admin-utils"'
      );
      content = content.replace(
        /import \{([^}]+)\} from "@\/lib\/admin-utils";/,
        (match, imports) => {
          if (imports.includes("requireFullAdminApi")) return match;
          return `import {${imports.trim()}, requireFullAdminApi } from "@/lib/admin-utils";`;
        }
      );
    }
    content = content.replace(/requireAdminApi\(request\)/g, "requireFullAdminApi()");
  }

  if (content !== original) fs.writeFileSync(filePath, content);
}

walk(adminApiDir);
