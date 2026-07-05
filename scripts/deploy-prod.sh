#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/filminhere/app"
SERVICE_NAME="filminhere-next.service"
HEALTH_URL="http://127.0.0.1:3000/me/requests"

echo "== FilmInHere Production Deploy =="

cd "$APP_DIR"

echo
echo "Current commit:"
git log --oneline -1

echo
echo "Checking working tree..."
if [ -n "$(git status --short)" ]; then
  echo "ERROR: Working tree is not clean. Resolve this before deploying:"
  git status --short
  exit 1
fi

echo
echo "Pulling latest main..."
git pull --ff-only origin main

echo
echo "New commit:"
git log --oneline -1

echo
echo "Building Next app..."
npm run build

echo
echo "Restarting ${SERVICE_NAME}..."
sudo systemctl restart "$SERVICE_NAME"

echo
echo "Service status:"
sudo systemctl status "$SERVICE_NAME" --no-pager -l

echo
echo "Health check:"
for attempt in $(seq 1 30); do
  if curl -I "$HEALTH_URL"; then
    echo "Health check passed."
    break
  fi

  if [ "$attempt" -eq 30 ]; then
    echo "ERROR: Health check failed after 30 attempts." >&2
    exit 1
  fi

  echo "Waiting for app..."
  sleep 1
done

echo
echo "Deploy complete."
