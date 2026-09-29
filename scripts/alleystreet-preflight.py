#!/usr/bin/env python3
"""Run deterministic Alleystreet delivery release checks."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path


REQUIRED_FILES = (
    "AGENTS.md",
    "ALLEYSTREET_STANDARD.md",
    "SECURITY_BASELINE.md",
    "PRIVACY_AND_DATA_RULES.md",
    "ACCEPTANCE_TESTS.md",
    "RELEASE_REPORT.md",
)

SKIP_DIRS = {
    ".git", ".next", ".cache", ".venv", "node_modules", "vendor",
    "dist", "build", "coverage", "tmp", "temp",
}

TEXT_SUFFIXES = {
    ".md", ".txt", ".json", ".yaml", ".yml", ".toml", ".ini", ".env",
    ".js", ".jsx", ".ts", ".tsx", ".py", ".rb", ".php", ".go", ".java",
    ".html", ".css", ".scss", ".sh", ".ps1", ".xml", ".properties",
}

SECRET_PATTERNS = (
    ("private key material", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")),
    ("AWS access key", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("GitHub token", re.compile(r"\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}\b")),
    ("Stripe live secret", re.compile(r"\bsk_live_[A-Za-z0-9]{16,}\b")),
    ("assigned secret", re.compile(
        r"(?i)\b(?:api[_-]?key|secret|token|password)\b\s*[:=]\s*['\"][^'\"\s]{12,}['\"]"
    )),
)


@dataclass
class Finding:
    level: str
    check: str
    message: str
    path: str | None = None
    line: int | None = None


def iter_text_files(root: Path):
    for path in root.rglob("*"):
        if not path.is_file() or any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.name.startswith(".env") or path.suffix.lower() in TEXT_SUFFIXES:
            try:
                if path.stat().st_size <= 2_000_000:
                    yield path
            except OSError:
                continue


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def relative(path: Path, root: Path) -> str:
    try:
        return str(path.relative_to(root))
    except ValueError:
        return str(path)


def run(root: Path) -> list[Finding]:
    findings: list[Finding] = []

    for name in REQUIRED_FILES:
        path = root / name
        if not path.is_file():
            findings.append(Finding("BLOCKER", "required-file", f"Missing required file: {name}", name))

    agents = root / "AGENTS.md"
    if agents.is_file():
        text = read_text(agents).lower()
        if "alleystreet_standard.md" not in text or "release_report.md" not in text:
            findings.append(Finding(
                "BLOCKER", "project-instructions",
                "AGENTS.md must require the Alleystreet standard and release report.", "AGENTS.md"
            ))

    acceptance = root / "ACCEPTANCE_TESTS.md"
    if acceptance.is_file():
        text = read_text(acceptance)
        unchecked = [
            idx for idx, line in enumerate(text.splitlines(), start=1)
            if re.match(r"^\s*- \[ \] \[CRITICAL\]", line, flags=re.IGNORECASE)
        ]
        for line_no in unchecked:
            findings.append(Finding(
                "BLOCKER", "critical-gate", "Unchecked critical acceptance gate.",
                "ACCEPTANCE_TESTS.md", line_no
            ))
        if "[CRITICAL]" not in text:
            findings.append(Finding(
                "BLOCKER", "critical-gate", "No critical acceptance gates were found.",
                "ACCEPTANCE_TESTS.md"
            ))

    report = root / "RELEASE_REPORT.md"
    if report.is_file():
        text = read_text(report)
        decision = re.search(
            r"(?im)^\s*(?:release )?decision\s*:\s*(PASS|BLOCKED|PASS WITH WARNINGS)\s*$", text
        )
        if not decision:
            findings.append(Finding(
                "BLOCKER", "release-decision",
                "RELEASE_REPORT.md needs a valid 'Release decision:' line.", "RELEASE_REPORT.md"
            ))
        elif decision.group(1).upper() == "BLOCKED":
            findings.append(Finding(
                "BLOCKER", "release-decision", "Release report decision is BLOCKED.", "RELEASE_REPORT.md"
            ))
        for field in ("Approver:", "Evidence:", "Rollback", "Known warnings:"):
            if field.lower() not in text.lower():
                findings.append(Finding(
                    "BLOCKER", "release-report", f"Release report is missing field: {field}",
                    "RELEASE_REPORT.md"
                ))

    for path in iter_text_files(root):
        try:
            text = read_text(path)
        except OSError as exc:
            findings.append(Finding(
                "WARN", "read-error", f"Could not inspect file: {exc}", relative(path, root)
            ))
            continue
        for label, pattern in SECRET_PATTERNS:
            match = pattern.search(text)
            if match:
                line_no = text.count("\n", 0, match.start()) + 1
                findings.append(Finding(
                    "BLOCKER", "secret-scan", f"Possible {label}; remove and rotate it.",
                    relative(path, root), line_no
                ))
        if path.suffix.lower() in {".html", ".js", ".jsx", ".ts", ".tsx", ".css", ".json", ".yaml", ".yml"}:
            for line_no, line in enumerate(text.splitlines(), start=1):
                if "http://" in line and "localhost" not in line and "127.0.0.1" not in line:
                    findings.append(Finding(
                        "WARN", "insecure-url", "Non-TLS URL found; verify this is intentional.",
                        relative(path, root), line_no
                    ))

    return findings


def main() -> int:
    parser = argparse.ArgumentParser(description="Alleystreet delivery preflight")
    parser.add_argument("--root", default=".", help="Project root to inspect")
    parser.add_argument("--json", action="store_true", help="Emit JSON")
    args = parser.parse_args()

    root = Path(args.root).expanduser().resolve()
    if not root.is_dir():
        print(f"ERROR: project root is not a directory: {root}", file=sys.stderr)
        return 2

    findings = run(root)
    blockers = [item for item in findings if item.level == "BLOCKER"]
    warnings = [item for item in findings if item.level == "WARN"]
    decision = "BLOCKED" if blockers else ("PASS WITH WARNINGS" if warnings else "PASS")

    if args.json:
        print(json.dumps({
            "root": str(root),
            "decision": decision,
            "blocker_count": len(blockers),
            "warning_count": len(warnings),
            "findings": [asdict(item) for item in findings],
        }, indent=2))
    else:
        print(f"Alleystreet preflight: {decision}")
        print(f"Blockers: {len(blockers)} | Warnings: {len(warnings)}")
        for item in findings:
            location = item.path or "project"
            if item.line:
                location += f":{item.line}"
            print(f"[{item.level}] {item.check} — {location} — {item.message}")

    return 1 if blockers else 0


if __name__ == "__main__":
    raise SystemExit(main())
