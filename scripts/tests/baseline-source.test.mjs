import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { baselinePath, baselineStatements, executableBaseline } from "../baseline-source.mjs";

test("baseline conversion preserves complete functions and all numbered statements", () => {
  const statements = baselineStatements();
  assert.equal(statements.length, 775);
  const output = executableBaseline();
  assert.equal((output.match(/^-- Original statement /gm) ?? []).length, 775);
  assert.ok(output.includes(statements[20] + ";"));
  assert.ok(output.includes(statements[774] + ";"));
});

test("baseline source changes fail closed but Windows line endings remain portable", () => {
  const source = readFileSync(baselinePath, "utf8").replace(/\r\n/g, "\n");
  assert.equal(baselineStatements(source.replace(/\n/g, "\r\n")).length, 775);
  assert.throws(() => baselineStatements(source.replace('SET statement_timeout = 0', 'SET statement_timeout = 1')), /snapshot changed/);
});
