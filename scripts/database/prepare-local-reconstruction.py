#!/usr/bin/env python3
"""Prepare a disposable local reconstruction; never connect to a database.

The historical remote_schema file is an immutable, numbered evidence snapshot,
not a directly executable CLI migration. This adapter validates that exact
snapshot and writes separate, terminated SQL plus an explicit manifest outside
the repository. Its output is NOT a Production migration or proof that an
unmodified ``supabase db reset`` works.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import sys


BASELINE_NAME = "20261001023713_remote_schema.sql"
BASELINE_SHA256 = "04492fc3c32900522dbec23d0ce5efd5227d2f09f744594c5ac5fd1dce713255"
EXPECTED_STATEMENTS = 775
REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
MIGRATIONS_DIRECTORY = REPOSITORY_ROOT / "supabase" / "migrations"

# Only these exact managed-service statements may be omitted. Keep supported
# PostgreSQL extensions, all application objects, grants and default privileges.
PLAIN_POSTGRES_OMISSIONS = {
    12: 'CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql"',
    15: 'CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault"',
    488: 'ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres"',
}

SESSION_RESET_SQL = (
    "-- Run after the adapted baseline and before subsequent migrations or role tests.\n"
    "-- These settings otherwise leak from the historical dump into this session.\n"
    "SET row_security = on;\n"
    "SET search_path = public, extensions;\n"
)


class PreparationError(ValueError):
    """Input or destination failed a safety/integrity check."""


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def parse_snapshot(text: str) -> list[tuple[int, str]]:
    """Validate numbered boundaries without splitting SQL function bodies."""
    marker_pattern = re.compile(r"^-- statement ([1-9][0-9]*) of ([1-9][0-9]*)\r?$", re.M)
    markers = list(marker_pattern.finditer(text))
    possible_markers = [
        marker for marker in re.finditer(r"^[ \t]*--[ \t]*statement\b[^\r\n]*", text, re.M | re.I)
        if marker.group().strip() != "-- Statement count: 775"
    ]
    if len(possible_markers) != len(markers):
        raise PreparationError("Unexpected or malformed statement marker in evidence snapshot.")
    if len(markers) != EXPECTED_STATEMENTS:
        raise PreparationError(
            f"Expected {EXPECTED_STATEMENTS} statement markers; found {len(markers)}."
        )
    header = text[: markers[0].start()]
    if "-- EVIDENCE SNAPSHOT ONLY." not in header:
        raise PreparationError("Evidence-only header is missing.")
    if "-- Statement count: 775" not in header:
        raise PreparationError("Expected statement-count header is missing.")
    if any(line.strip() and not line.lstrip().startswith("--") for line in header.splitlines()):
        raise PreparationError("Unexpected executable content before the first numbered statement.")

    statements = []
    for position, marker in enumerate(markers, start=1):
        number, total = map(int, marker.groups())
        if number != position or total != EXPECTED_STATEMENTS:
            raise PreparationError(
                f"Statement numbering mismatch at position {position}: {number} of {total}."
            )
        end = markers[position].start() if position < len(markers) else len(text)
        statement = text[marker.end() : end].strip()
        if not statement or not any(
            line.strip() and not line.lstrip().startswith("--")
            for line in statement.splitlines()
        ):
            raise PreparationError(f"Empty statement at marker {number}.")
        statements.append((number, statement))
    return statements


def validate_output_directory(path: Path) -> Path:
    output = path.expanduser().resolve()
    if output == REPOSITORY_ROOT or REPOSITORY_ROOT in output.parents:
        raise PreparationError("Output must be outside the repository, never in active migrations.")
    if output.exists() and (not output.is_dir() or any(output.iterdir())):
        raise PreparationError("Output directory must not exist or must be empty; nothing is overwritten.")
    return output


def prepare(output_directory: Path, mode: str) -> dict:
    if mode not in {"plain-postgres", "supabase"}:
        raise PreparationError(f"Unsupported mode: {mode}")
    output = validate_output_directory(output_directory)
    baseline_bytes = (MIGRATIONS_DIRECTORY / BASELINE_NAME).read_bytes()
    baseline_hash = sha256(baseline_bytes)
    if baseline_hash != BASELINE_SHA256:
        raise PreparationError(
            "Historical snapshot checksum changed. Review the evidence before updating this adapter."
        )
    statements = parse_snapshot(baseline_bytes.decode("utf-8"))
    for number, expected_sql in PLAIN_POSTGRES_OMISSIONS.items():
        if statements[number - 1][1] != expected_sql:
            raise PreparationError(f"Managed-service statement {number} no longer matches its allowlist.")

    copied_migrations = []
    subsequent_sources = []
    for source in sorted(MIGRATIONS_DIRECTORY.glob("*.sql")):
        if not re.fullmatch(r"[0-9]{14}_[A-Za-z0-9_]+\.sql", source.name):
            raise PreparationError(f"Unexpected migration filename: {source.name}")
        if source.name == BASELINE_NAME:
            continue
        if source.name < BASELINE_NAME:
            raise PreparationError(f"Unexpected migration before the historical baseline: {source.name}")
        contents = source.read_bytes()
        relative_destination = f"migrations/{source.name}"
        copied_migrations.append(
            {"source": f"supabase/migrations/{source.name}", "output": relative_destination,
             "sha256": sha256(contents), "bytes": len(contents), "copied_byte_for_byte": True}
        )
        subsequent_sources.append((relative_destination, contents))

    skipped = []
    sql_parts = [
        "-- DISPOSABLE LOCAL RECONSTRUCTION ADAPTER OUTPUT ONLY.\n"
        "-- Not a Production migration; not raw Supabase CLI replay.\n"
        f"-- Immutable evidence SHA256: {baseline_hash}\n"
        "-- Application grants/default privileges are retained for honest auditing.\n"
    ]
    for number, statement in statements:
        if mode == "plain-postgres" and number in PLAIN_POSTGRES_OMISSIONS:
            skipped.append({"statement_index": number, "sql": statement,
                            "reason": "Managed Supabase extension or publication unavailable in plain PostgreSQL."})
            continue
        terminated = statement if statement.endswith(";") else statement + ";"
        sql_parts.append(f"-- evidence statement {number} of {EXPECTED_STATEMENTS}\n{terminated}\n")
    baseline_output = "baseline.local-only.sql"
    reset_output = "reset-session.local-only.sql"
    baseline_sql = "\n".join(sql_parts).encode("utf-8")
    reset_sql = SESSION_RESET_SQL.encode("utf-8")
    manifest = {
        "format_version": 1,
        "purpose": "disposable-local-reconstruction-only",
        "mode": mode,
        "database_connections_made": False,
        "production_use_authorized": False,
        "raw_supabase_cli_replay_verified": False,
        "original_snapshot_modified": False,
        "baseline": {
            "source": f"supabase/migrations/{BASELINE_NAME}",
            "sha256": baseline_hash,
            "bytes": len(baseline_bytes),
            "numbered_statement_count": EXPECTED_STATEMENTS,
            "emitted_statement_count": EXPECTED_STATEMENTS - len(skipped),
            "output": baseline_output,
            "output_sha256": sha256(baseline_sql),
        },
        "skipped_statements": skipped,
        "session_reset": {"output": reset_output, "sha256": sha256(reset_sql)},
        "subsequent_migration_count": len(copied_migrations),
        "subsequent_migrations": copied_migrations,
        "execution_order": [baseline_output, reset_output]
        + [entry["output"] for entry in copied_migrations],
        "prerequisites_not_provided": [
            "An isolated disposable database; this script never creates or selects one.",
            "Supabase-compatible roles, auth.users/auth.uid(), and required schemas.",
            "Supported PostgreSQL extensions installed in the local test environment.",
        ],
        "limitations": [
            "Preparation is not database execution or an application access test.",
            "Original historical statement boundaries receive terminal semicolons in separate output.",
            "The source evidence snapshot and all subsequent source migrations remain unchanged.",
            "Historical broad grants and default privileges are deliberately retained, not silently corrected.",
            "Supabase mode retains all managed-service statements and still requires a compatible local stack.",
        ],
    }

    # All validation and reads complete before creating output. Exclusive writes
    # prevent accidental overwrite even if another process creates a destination.
    output.mkdir(parents=True, exist_ok=True)
    (output / "migrations").mkdir()
    for relative, contents in [(baseline_output, baseline_sql), (reset_output, reset_sql)] + subsequent_sources:
        with (output / relative).open("xb") as handle:
            handle.write(contents)
    with (output / "manifest.json").open("x", encoding="utf-8") as handle:
        json.dump(manifest, handle, indent=2)
        handle.write("\n")
    return manifest


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, required=True,
                        help="Empty or new directory outside this repository.")
    parser.add_argument("--mode", choices=("plain-postgres", "supabase"), default="plain-postgres",
                        help="Plain PostgreSQL omits exactly three documented managed-service statements.")
    args = parser.parse_args()
    try:
        manifest = prepare(args.output_dir, args.mode)
    except (PreparationError, OSError, UnicodeError) as error:
        print(f"Preparation refused: {error}", file=sys.stderr)
        return 1
    print(json.dumps({
        "output_directory": str(args.output_dir.expanduser().resolve()),
        "mode": args.mode,
        "baseline_statements_emitted": manifest["baseline"]["emitted_statement_count"],
        "skipped_statement_indices": [item["statement_index"] for item in manifest["skipped_statements"]],
        "subsequent_migrations_copied": manifest["subsequent_migration_count"],
        "database_connections_made": False,
    }, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
