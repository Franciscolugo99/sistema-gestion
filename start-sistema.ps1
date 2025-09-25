# ⚡ Habilitar ejecución de scripts en esta sesión
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

Write-Host "🚀 Iniciando Sistema de Gestión..." -ForegroundColor Cyan

# 1) Actualizar repo
Write-Host "🔄 Actualizando desde GitHub..."
git pull

# 2) Levantar contenedores Docker
Write-Host "🐘 Levantando Postgres + Adminer..."
cd "$PSScriptRoot\infra"
docker compose up -d

# 3) Arrancar API (nueva ventana PowerShell)
Write-Host "⚙️ Iniciando API NestJS..."
cd "$PSScriptRoot\apps\api"
Start-Process powershell -ArgumentList "cd `"$PWD`"; pnpm install; pnpm start:dev"

# 4) Arrancar Frontend (nueva ventana PowerShell)
Write-Host "🌐 Iniciando Frontend React..."
cd "$PSScriptRoot\apps\web"
Start-Process powershell -ArgumentList "cd `"$PWD`"; pnpm install; pnpm dev"

Write-Host "✅ Todo en marcha!"
Write-Host "   - API:      http://localhost:3000/products"
Write-Host "   - Frontend: http://localhost:5173"
Write-Host "   - Adminer:  http://localhost:8080"
