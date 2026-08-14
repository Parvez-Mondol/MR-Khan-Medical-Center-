#!/usr/bin/env pwsh
Write-Host "Bringing up development stack (Mongo + app)..."
docker compose up --build -d
if ($LASTEXITCODE -ne 0) { Write-Error "docker compose up failed"; exit 1 }

Write-Host "Tailing logs (Ctrl+C to exit)"
docker compose logs -f
