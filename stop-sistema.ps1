Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

Write-Host "🛑 Deteniendo servicios..." -ForegroundColor Yellow

cd "$PSScriptRoot\infra"
docker compose down

Write-Host "✅ Listo."