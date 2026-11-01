import { writeFileSync } from "node:fs";
import { executableBaseline } from "./baseline-source.mjs";

const [output, ...extra] = process.argv.slice(2);
if (!output || extra.length) throw new Error("Usage: node scripts/prepare-baseline.mjs OUTPUT.sql");
// Output only: no database client, connection, credentials or execution.
writeFileSync(output,
  "-- REVIEW CANDIDATE: requires a fresh compatible Supabase environment.\n" +
  "-- Preserves all 775 historical statements, including managed extensions.\n" +
  "-- Do not apply to an existing project; this is not an incremental migration.\n\n" +
  executableBaseline(), { flag: "wx" });
console.log("Prepared baseline candidate; no database was contacted.");
