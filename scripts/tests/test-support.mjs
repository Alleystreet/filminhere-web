import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Execute the real TypeScript module with deterministic API/DB test doubles.
// These tests never contact Supabase or read runtime credentials.
export function loadTS(path, dependencies, globals = {}) {
  const source = readFileSync(path, "utf8");
  const { outputText } = ts.transpileModule(source, { fileName: path, compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
  const testModule = { exports: {} };
  const context = {
    module: testModule, exports: testModule.exports,
    require(name) {
      if (!(name in dependencies)) throw new Error(`Unexpected test import ${name}`);
      return dependencies[name];
    },
    console,
    crypto: { randomUUID: () => "00000000-0000-4000-8000-000000000099" },
    process: { env: { NEXT_PUBLIC_SUPABASE_URL: "https://example.invalid", NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-public", SUPABASE_SERVICE_ROLE_KEY: "test-server" } },
    ...globals,
  };
  vm.runInNewContext(outputText, context, { filename: path });
  return testModule.exports;
}

export const nextServer = { NextResponse: { json: (body, options = {}) => ({ body, status: options.status ?? 200 }) } };
export const request = (body, token = "test-jwt") => ({ headers: { get: () => token ? `Bearer ${token}` : null }, json: async () => body });

export function makeDB({ user = { id: "filmmaker" }, tables = {}, insertError = null } = {}) {
  const queries = [];
  const inserts = [];
  const rpcs = [];
  const client = {
    auth: { getUser: async () => ({ data: { user }, error: null }), getSession: async () => ({ data: { session: user ? { access_token: "test-jwt" } : null }, error: null }) },
    from(table) {
      const query = { table, filters: [], orders: [] };
      queries.push(query);
      const result = () => {
        const source = tables[table];
        if (source?.error) return source;
        const data = (source ?? []).filter(row => query.filters.every(([key, value]) => row[key] === value));
        return { data, error: null };
      };
      const chain = {
        select: () => chain,
        eq: (key, value) => { query.filters.push([key, value]); return chain; },
        or: (value) => { query.or = value; return chain; },
        in: () => chain,
        order: (key, value) => { query.orders.push([key, value]); return chain; },
        limit: () => chain,
        maybeSingle: async () => { const r = result(); return { ...r, data: r.data?.[0] ?? null }; },
        insert: async (row) => { inserts.push({ table, row }); return { error: insertError }; },
        update: () => chain,
        then: (resolve, reject) => Promise.resolve(result()).then(resolve, reject),
      };
      return chain;
    },
    rpc: async (name, args) => { rpcs.push({ name, args }); return { error: null }; },
  };
  return { client, queries, inserts, rpcs };
}
