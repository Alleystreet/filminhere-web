import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export const baselinePath = new URL("../supabase/migrations/20261001023713_remote_schema.sql", import.meta.url);
const reviewedHash = "1c27e98eeca65ee7f8db4bdccf3587a129206eee4f190f5cf022349cc9a54929";

export function baselineStatements(source = readFileSync(baselinePath, "utf8")) {
  const normalized = source.replace(/\r\n/g, "\n");
  if (createHash("sha256").update(normalized).digest("hex") !== reviewedHash) {
    throw new Error("Baseline snapshot changed; reconcile it before rebuilding.");
  }
  const parts = normalized.split(/^-- statement (\d+) of 775\n/gm);
  const statements = [];
  for (let i = 1; i < parts.length; i += 2) {
    if (Number(parts[i]) !== statements.length + 1 || !parts[i + 1]?.trim()) {
      throw new Error("Baseline statement sequence is incomplete.");
    }
    statements.push(parts[i + 1].trim());
  }
  if (statements.length !== 775) throw new Error("Expected all 775 baseline statements.");
  return statements;
}

// The numbered boundaries preserve semicolons inside function bodies and strings.
export function executableBaseline(statements = baselineStatements()) {
  return statements.map((statement, index) =>
    `-- Original statement ${index + 1}\n${statement};\n`).join("\n");
}
