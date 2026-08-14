#!/usr/bin/env bash
echo "Bringing up development stack (Mongo + app)..."
docker compose up --build -d
if [ $? -ne 0 ]; then
  echo "docker compose up failed" >&2
  exit 1
fi

echo "Tailing logs (Ctrl+C to exit)"
docker compose logs -f
