#!/usr/bin/env python3
"""Reconstruct and test an EMPTY, disposable local FilmInHere audit database.

This runner never creates, drops, resets, or selects a hosted database. An
operator must provide the empty local database, Supabase-style roles, PostgreSQL
extensions, and (with --api) a PostgREST bound to the same database. The database
is intentionally left available for inspection after the run.
"""

from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile


ROOT = Path(__file__).resolve().parents[2]
BASELINE_NAME = "20261001023713_remote_schema.sql"
BASELINE_SHA256 = "04492fc3c32900522dbec23d0ce5efd5227d2f09f744594c5ac5fd1dce713255"
CORRECTION_NAME = "20261021195905_explicit_public_data_api_permissions.sql"
BASELINE = ROOT / "supabase" / "migrations" / BASELINE_NAME
CORRECTION = ROOT / "supabase" / "migrations" / CORRECTION_NAME
DATABASE_NAME = re.compile(r"filminhere_audit[a-z0-9_]*\Z")
API_ORIGIN = "http://127.0.0.1:55440"


class TestFailure(RuntimeError):
    """A safety check or test failed; keep the database available for inspection."""


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def fingerprint(value: object) -> str:
    return digest(json.dumps(value, sort_keys=True, separators=(",", ":")).encode())


def redacted(text: str) -> str:
    # Only synthetic test credentials should be present. Redact known sensitive
    # environment values and JWT-shaped strings even on unexpected failure paths.
    for name, value in os.environ.items():
        if value and len(value) >= 8 and re.search(r"PASSWORD|PASSWD|SECRET|TOKEN|API_KEY|SERVICE_ROLE_KEY", name, re.I):
            text = text.replace(value, "[REDACTED]")
    return re.sub(r"\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b", "[REDACTED_JWT]", text)


def local_environment(database: str) -> dict[str, str]:
    # A service file, PGOPTIONS, alternate host address, password file, or other
    # inherited libpq setting must not change the explicitly selected target.
    env = {name: value for name, value in os.environ.items() if not name.startswith("PG")}
    env.update(PGHOST="127.0.0.1", PGPORT="55439", PGUSER="postgres", PGDATABASE=database)
    return env


POLICY_SQL = """
select json_build_object(
  'policies', (select coalesce(json_agg(p order by schemaname,tablename,policyname),'[]'::json)
    from (select schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check
          from pg_policies where schemaname in ('public','private')) p),
  'row_security', (select coalesce(json_agg(t order by schema_name,table_name),'[]'::json)
    from (select n.nspname as schema_name,c.relname as table_name,
                 c.relrowsecurity,c.relforcerowsecurity
          from pg_class c join pg_namespace n on n.oid=c.relnamespace
          where n.nspname in ('public','private') and c.relkind in ('r','p')) t)
);
"""

DEFAULTS_SQL = """
select coalesce(json_agg(d order by schema_name,object_type),'[]'::json)
from (select coalesce(n.nspname,'<global>') as schema_name,
             a.defaclobjtype::text as object_type,a.defaclacl::text as acl
      from pg_default_acl a left join pg_namespace n on n.oid=a.defaclnamespace
      where a.defaclrole='postgres'::regrole
        and (a.defaclnamespace=0 or n.nspname='public')) d;
"""

HISTORICAL_PROBE_SQL = """
begin;
create table public.permissions_historical_default_probe(id bigint);
select json_agg(json_build_object('role',r,'privilege',p,
                  'allowed',has_table_privilege(r,'public.permissions_historical_default_probe',p))
                order by r,p)
from unnest(array['anon','authenticated','service_role']) r
cross join unnest(array['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN']) p;
drop table public.permissions_historical_default_probe;
rollback;
"""


class Runner:
    def __init__(self, args: argparse.Namespace, output: Path):
        self.args = args
        self.output = output
        self.env = local_environment(args.database)
        self.steps: list[dict] = []
        # The database name was validated against a restrictive identifier regex.
        self.guard = f"""
do $local_guard$ begin
  if inet_server_addr() is null
     or inet_server_addr() not in ('127.0.0.1'::inet,'::1'::inet)
     or inet_server_port() <> 55439
     or current_database() <> '{args.database}'
     or current_user <> 'postgres' then
    raise exception 'Only the explicitly named local audit database on port 55439 is allowed';
  end if;
end $local_guard$;
set search_path=public,extensions;
set row_security=on;
"""

    def command(self, label: str, command: list[str], *, check: bool = True,
                env: dict[str, str] | None = None) -> subprocess.CompletedProcess:
        try:
            result = subprocess.run(command, cwd=ROOT, env=env or self.env,
                                    text=True, capture_output=True, timeout=180, check=False)
        except (OSError, subprocess.TimeoutExpired) as error:
            raise TestFailure(f"{label}: {redacted(str(error))}") from error
        filename = f"{len(self.steps) + 1:02d}-{label}.log"
        log = f"exit_code: {result.returncode}\nSTDOUT\n{result.stdout}\nSTDERR\n{result.stderr}"
        (self.output / filename).write_text(redacted(log), encoding="utf-8")
        self.steps.append({"step": label, "exit_code": result.returncode, "log": filename})
        if check and result.returncode:
            raise TestFailure(f"{label} failed; see {filename}.")
        return result

    def psql(self, label: str, *, sql: str | None = None, file: Path | None = None,
             transaction: bool = False, check: bool = True) -> subprocess.CompletedProcess:
        command = [self.args.psql, "-h", "127.0.0.1", "-p", "55439", "-U", "postgres",
                   "-d", self.args.database, "-X", "-v", "ON_ERROR_STOP=1", "-w", "-q", "-A", "-t"]
        if transaction:
            command.append("-1")
        command.extend(["-c", self.guard])
        if file is not None:
            command.extend(["-f", str(file)])
        if sql is not None:
            command.extend(["-c", sql])
        return self.command(label, command, check=check)

    def query_json(self, label: str, sql: str) -> object:
        result = self.psql(label, sql=sql)
        try:
            return json.loads(result.stdout.strip())
        except json.JSONDecodeError as error:
            raise TestFailure(f"{label} returned unexpected non-JSON output.") from error


def prepare_output(path: Path) -> Path:
    output = path.expanduser().resolve()
    if output == ROOT or ROOT in output.parents:
        docs = ROOT / "docs"
        if output == docs or docs not in output.parents:
            raise TestFailure("In-repository reports must use an explicit directory under docs/.")
    if output.exists() and (not output.is_dir() or any(output.iterdir())):
        raise TestFailure("Report directory must be new or empty; existing evidence is never overwritten.")
    output.mkdir(parents=True, exist_ok=True)
    return output


def verify_tap(stdout: str) -> dict:
    if re.search(r"^\s*(?:not ok\b|Bail out!)", stdout, re.M | re.I):
        raise TestFailure("pgTAP reported a failed test or bailout.")
    plans = re.findall(r"^\s*1\.\.([0-9]+)\s*$", stdout, re.M)
    numbers = [int(value) for value in re.findall(r"^\s*ok\s+([0-9]+)(?:\s|$)", stdout, re.M)]
    if len(plans) != 1 or not numbers:
        raise TestFailure("pgTAP output is missing a unique plan or numbered passing tests.")
    planned = int(plans[0])
    if planned < 1 or numbers != list(range(1, planned + 1)):
        raise TestFailure("pgTAP plan/count/numbering mismatch.")
    return {"status": "PASS", "planned": planned, "passed": len(numbers), "failed": 0}


def run(args: argparse.Namespace, output: Path, report: dict) -> None:
    if digest(BASELINE.read_bytes()) != BASELINE_SHA256:
        raise TestFailure("Historical evidence checksum changed; no SQL was executed.")
    runner = Runner(args, output)
    report["steps"] = runner.steps
    git = runner.command("git-source", ["git", "rev-parse", "HEAD"])
    report["source_commit"] = git.stdout.strip()
    dirty = runner.command("git-status", ["git", "status", "--porcelain"])
    report["source_worktree_dirty"] = bool(dirty.stdout.strip())
    report["source_test_files"] = [
        {"file": str(path.relative_to(ROOT)), "sha256": digest(path.read_bytes())}
        for path in [Path(__file__).resolve(), ROOT / "scripts/database/prepare-local-reconstruction.py",
                     ROOT / "tests/database/local-auth-shim.sql",
                     ROOT / "tests/database/simulate-explicit-defaults.sql",
                     ROOT / "tests/database/permissions-fixtures.sql",
                     ROOT / "tests/database/permissions-catalog.sql",
                     ROOT / "tests/database-permissions.api.mjs"]
    ]
    version = runner.command("psql-version", [args.psql, "--version"])
    report["psql_version"] = version.stdout.strip()

    runner.psql("empty-local-target-preflight", sql="""
do $preflight$ begin
  if exists (select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
             where n.nspname='public') or to_regclass('auth.users') is not null then
    raise exception 'Refusing a populated database: public relations must be empty and auth.users absent';
  end if;
  if current_setting('server_version_num')::integer < 170000 then
    raise exception 'PostgreSQL 17 or later is required for the MAINTAIN privilege assertions';
  end if;
  if (select count(*) from pg_roles where rolname in ('anon','authenticated','service_role')) <> 3 then
    raise exception 'Create the three Supabase-style roles in the local runtime before testing';
  end if;
  if exists(select 1 from pg_roles where rolname in ('anon','authenticated')
            and (rolsuper or rolbypassrls))
     or not exists(select 1 from pg_roles where rolname='service_role' and rolbypassrls) then
    raise exception 'Local role attributes do not match the required nonprivileged/browser and BYPASSRLS service roles';
  end if;
  if (select count(*) from pg_available_extensions
      where name in ('pgtap','btree_gist','pg_stat_statements','pgcrypto','uuid-ossp')) <> 5 then
    raise exception 'Install pgtap, btree_gist, pg_stat_statements, pgcrypto and uuid-ossp in the local runtime';
  end if;
end $preflight$;
""")
    report["server"] = runner.query_json("server-version", """
select json_build_object('version',version(),'server_version_num',current_setting('server_version_num'),
                         'address',inet_server_addr()::text,'port',inet_server_port(),
                         'database',current_database(),'user',current_user);
""")

    # -1 ensures the deliberately failing raw-snapshot attempt cannot leave
    # partial objects. The expected error is syntax, not a connection failure.
    raw = runner.psql("raw-baseline-expected-failure", file=BASELINE, transaction=True, check=False)
    if raw.returncode == 0 or not re.search(r"syntax error", raw.stderr, re.I):
        raise TestFailure("Raw evidence snapshot did not fail with the expected SQL syntax error.")
    remaining = runner.query_json("raw-baseline-empty-proof", """
select json_build_object('public_relation_count',count(*))
from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public';
""")
    if remaining != {"public_relation_count": 0}:
        raise TestFailure("Raw snapshot failure left unexpected public relations.")
    report["raw_baseline"] = {"expected_syntax_failure": True, "public_relation_count_after": 0,
                              "sha256": digest(BASELINE.read_bytes())}

    with tempfile.TemporaryDirectory(prefix="filminhere-permissions-reconstruction-") as temp:
        staging = Path(temp) / "staging"
        runner.command("prepare-disposable-reconstruction", [sys.executable,
                       str(ROOT / "scripts/database/prepare-local-reconstruction.py"),
                       "--output-dir", str(staging), "--mode", "plain-postgres"])
        manifest = json.loads((staging / "manifest.json").read_text())
        if (manifest["baseline"]["emitted_statement_count"] != 772
                or [item["statement_index"] for item in manifest["skipped_statements"]] != [12, 15, 488]):
            raise TestFailure("Adapter output does not match the reviewed reconstruction scope.")
        (output / "reconstruction-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
        report["reconstruction"] = manifest
        if sum(item["output"].endswith("/" + CORRECTION_NAME)
               for item in manifest["subsequent_migrations"]) != 1:
            raise TestFailure("Expected exactly one forward correction in the ordered migration inventory.")

        runner.psql("local-auth-shim", file=ROOT / "tests/database/local-auth-shim.sql")
        runner.psql("adapted-baseline", file=staging / manifest["baseline"]["output"])
        runner.psql("baseline-session-reset", file=staging / manifest["session_reset"]["output"])
        probe = runner.query_json("historical-defaults-exposure-probe", HISTORICAL_PROBE_SQL)
        if not isinstance(probe, list) or len(probe) != 24 or not all(item["allowed"] for item in probe):
            raise TestFailure("Historical defaults probe did not show the expected three-role broad access.")
        report["historical_defaults_probe"] = {"broad_privileges_confirmed": 24, "probe_rolled_back": True}

        before_defaults = runner.query_json("baseline-only-defaults-before", DEFAULTS_SQL)
        rejected = runner.psql("baseline-only-correction-expected-failure", file=CORRECTION, check=False)
        if rejected.returncode == 0 or "Expected postgres-owned" not in rejected.stderr:
            raise TestFailure("Out-of-order correction did not fail at its reviewed schema prerequisite.")
        after_defaults = runner.query_json("baseline-only-defaults-after", DEFAULTS_SQL)
        if fingerprint(before_defaults) != fingerprint(after_defaults):
            raise TestFailure("Rejected baseline-only correction altered default privileges.")
        report["baseline_only_correction"] = {
            "expected_prerequisite_failure": True,
            "default_privileges_unchanged": True,
            "defaults_fingerprint": fingerprint(before_defaults),
        }

        runner.psql("simulate-new-explicit-defaults", file=ROOT / "tests/database/simulate-explicit-defaults.sql")
        for item in manifest["subsequent_migrations"]:
            migration = staging / item["output"]
            is_correction = migration.name == CORRECTION_NAME
            if is_correction:
                before_policies = runner.query_json("policies-before-correction", POLICY_SQL)
            runner.psql(f"migration-{migration.stem}", file=migration)
            if is_correction:
                after_policies = runner.query_json("policies-after-correction", POLICY_SQL)
                if fingerprint(before_policies) != fingerprint(after_policies):
                    raise TestFailure("Forward correction changed RLS policies or row-security flags.")
                first_defaults = runner.query_json("defaults-after-first-correction", DEFAULTS_SQL)
                runner.psql("repeat-forward-correction", file=migration)
                repeated_policies = runner.query_json("policies-after-repeat", POLICY_SQL)
                repeated_defaults = runner.query_json("defaults-after-repeat", DEFAULTS_SQL)
                if (fingerprint(after_policies) != fingerprint(repeated_policies)
                        or fingerprint(first_defaults) != fingerprint(repeated_defaults)):
                    raise TestFailure("Repeated correction changed policies or defaults unexpectedly.")
                report["forward_correction"] = {
                    "applied_twice": True, "policies_and_rls_unchanged": True,
                    "policy_fingerprint_before": fingerprint(before_policies),
                    "policy_fingerprint_after": fingerprint(after_policies),
                    "policy_fingerprint_after_repeat": fingerprint(repeated_policies),
                    "defaults_fingerprint_after_repeat": fingerprint(repeated_defaults),
                }

    runner.psql("install-local-pgtap", sql="create extension if not exists pgtap with schema extensions;")
    runner.psql("synthetic-fixtures", file=ROOT / "tests/database/permissions-fixtures.sql")
    tap = runner.psql("pgtap-permissions-catalog", file=ROOT / "tests/database/permissions-catalog.sql")
    report["pgtap"] = verify_tap(tap.stdout)
    runner.psql("notify-postgrest-schema-reload", sql="notify pgrst, 'reload schema';")
    report["api"] = {"status": "NOT_RUN", "reason": "--api was not requested"}
    if args.api:
        node = shutil.which("node")
        if node is None:
            raise TestFailure("node is required for --api.")
        api_env = dict(runner.env, PERMISSIONS_TEST_API_URL=API_ORIGIN)
        # The API script emits redacted JSON; keep all output under the runner's
        # sanitizing log/report handling rather than allowing a second raw writer.
        api = runner.command("local-supabase-js-api", [node, str(ROOT / "tests/database-permissions.api.mjs")],
                             check=False, env=api_env)
        try:
            api_summary = json.loads(redacted(api.stdout))
        except json.JSONDecodeError as error:
            raise TestFailure("Local API suite did not emit its expected JSON summary.") from error
        (output / "api-results.json").write_text(json.dumps(api_summary, indent=2) + "\n")
        report["api"] = api_summary
        if api.returncode or api_summary.get("status") != "PASS" or api_summary.get("failed") != 0:
            raise TestFailure("Local API permission suite failed.")
    report["status"] = "PASS"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--psql", required=True, help="Path to psql or a local psql wrapper; no shell command.")
    parser.add_argument("--database", default="filminhere_audit",
                        help="Already-created EMPTY local database; name must start filminhere_audit.")
    parser.add_argument("--output-dir", type=Path, required=True, help="New/empty evidence directory.")
    parser.add_argument("--api", action="store_true",
                        help="Also run the fixed-loopback PostgREST suite with a synthetic secret from the environment.")
    args = parser.parse_args()
    if not DATABASE_NAME.fullmatch(args.database) or len(args.database) > 63:
        parser.error("Database must match filminhere_audit[a-z0-9_]* and fit PostgreSQL's 63-byte identifier limit.")
    executable = shutil.which(args.psql)
    if executable is None:
        parser.error("--psql must identify an existing executable or wrapper.")
    args.psql = str(Path(executable).resolve())
    try:
        output = prepare_output(args.output_dir)
    except (TestFailure, OSError) as error:
        parser.error(str(error))
    report = {
        "suite": "filminhere-disposable-local-permissions",
        "started_at": now(), "status": "FAIL",
        "target": {"host": "127.0.0.1", "port": 55439, "database": args.database, "user": "postgres"},
        "hosted_targets_allowed": False,
        "database_created_dropped_or_reset": False,
        "credentials_logged": False,
        "limitations": [
            "The historical baseline is adapted for local testing; raw CLI replay remains invalid.",
            "The auth shim is not hosted Supabase Auth or a test of its service behavior.",
            "GraphQL, real browser sessions, hosted Preview and Production are not tested.",
            "For --api, the operator must bind the fixed-loopback PostgREST to this same named database.",
            "The local database and synthetic fixtures remain for inspection; this runner does not clean or reset them.",
        ],
    }
    try:
        run(args, output, report)
    except (TestFailure, OSError, ValueError, KeyError) as error:
        report["error"] = redacted(str(error))
    report["finished_at"] = now()
    report_path = output / "report.json"
    report_path.write_text(redacted(json.dumps(report, indent=2)) + "\n", encoding="utf-8")
    print(json.dumps({"status": report["status"], "report": str(report_path),
                      "pgtap": report.get("pgtap"), "api_status": report.get("api", {}).get("status")}))
    return 0 if report["status"] == "PASS" else 1


if __name__ == "__main__":
    sys.exit(main())
