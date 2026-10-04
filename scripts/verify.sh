#!/usr/bin/env bash
set -euo pipefail

# Minimal PR verification script for mixed Node/Python repos.
# Goals:
# - Fast default checks
# - Runs only what exists
# - Fails on errors (merge gate friendly)

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "== verify.sh =="
echo "Repo: $ROOT_DIR"
echo "Shell: $SHELL"
echo

# --- helpers ---
have() { command -v "$1" >/dev/null 2>&1; }
section() { echo; echo "---- $1 ----"; }

# --- git sanity (optional but helpful) ---
section "Git sanity"
if have git && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  # Show dirty files but don't fail by default.
  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "Working tree has changes (ok for local runs)."
    git status --porcelain
  else
    echo "Working tree clean."
  fi
else
  echo "Git not detected or not a git repo. Skipping."
fi

# --- Node checks (if package.json exists) ---
if [ -f "package.json" ]; then
  section "Node: install & checks"
  if have npm; then
    PKG_MGR="npm"
  elif have pnpm; then
    PKG_MGR="pnpm"
  elif have yarn; then
    PKG_MGR="yarn"
  else
    echo "No npm/pnpm/yarn found. Skipping Node checks."
    PKG_MGR=""
  fi

  if [ -n "${PKG_MGR}" ]; then
    echo "Package manager: ${PKG_MGR}"

    # Install deps in CI-friendly way when possible
    if [ "${PKG_MGR}" = "npm" ]; then
      if [ -f "package-lock.json" ]; then
        npm ci
      else
        npm install
      fi
    elif [ "${PKG_MGR}" = "pnpm" ]; then
      pnpm install --frozen-lockfile || pnpm install
    elif [ "${PKG_MGR}" = "yarn" ]; then
      yarn install --frozen-lockfile || yarn install
    fi

    # Run common scripts only if present
    run_if_script() {
      local script="$1"
      if node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts['${script}'] ? 0 : 1)"; then
        echo "Running: ${PKG_MGR} run ${script}"
        if [ "${PKG_MGR}" = "yarn" ]; then
          yarn "${script}"
        else
          ${PKG_MGR} run "${script}"
        fi
      else
        echo "No '${script}' script. Skipping."
      fi
    }

    run_if_script "lint"
    run_if_script "typecheck"
    run_if_script "test"
    run_if_script "build"
  fi
else
  section "Node"
  echo "No package.json found. Skipping Node checks."
fi

# --- Python checks (if pyproject.toml or requirements.txt exists) ---
PY_PRESENT=false
if [ -f "pyproject.toml" ] || [ -f "requirements.txt" ] || [ -f "setup.py" ]; then
  PY_PRESENT=true
fi

if [ "${PY_PRESENT}" = true ]; then
  section "Python: venv & checks"
  if have python3; then
    PY=python3
  elif have python; then
    PY=python
  else
    echo "No python found. Skipping Python checks."
    PY=""
  fi

  if [ -n "${PY}" ]; then
    echo "Python: $(${PY} --version)"

    # Create venv if not present (local-friendly). In CI you can skip by precreating.
    if [ ! -d ".venv" ]; then
      echo "Creating .venv"
      ${PY} -m venv .venv
    fi

    # shellcheck disable=SC1091
    source .venv/bin/activate

    # Upgrade pip tooling
    python -m pip install -U pip wheel setuptools >/dev/null

    # Install deps depending on repo style
    if [ -f "pyproject.toml" ]; then
      # Try editable install if supported; otherwise just install build requirements.
      if have pip; then
        pip install -e . >/dev/null 2>&1 || pip install . >/dev/null 2>&1 || true
      fi
    fi

    if [ -f "requirements.txt" ]; then
      pip install -r requirements.txt >/dev/null
    fi

    # Run common tools only if installed or config exists
    run_py_tool() {
      local tool="$1"
      local cmd="$2"
      if have "${tool}"; then
        echo "Running: ${cmd}"
        eval "${cmd}"
      else
        echo "Tool '${tool}' not installed. Skipping."
      fi
    }

    # Lint/format (optional)
    # If you want these enforced, add them to requirements/dev and they will run.
    run_py_tool "ruff" "ruff check ."
    run_py_tool "black" "black --check ."
    run_py_tool "pytest" "pytest -q"
  fi
else
  section "Python"
  echo "No pyproject.toml / requirements.txt / setup.py found. Skipping Python checks."
fi

section "Done"
echo "✅ verify.sh completed successfully."
