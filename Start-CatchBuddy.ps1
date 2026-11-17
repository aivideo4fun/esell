param([switch]$SkipInstall, [switch]$SkipBuild)
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

function Run-Checked {
    param([string]$Command, [string[]]$CommandArgs)
    & $Command @CommandArgs
    if ($LASTEXITCODE -ne 0) { throw "$Command failed. Stop here and share only the error, never your .env file." }
}

if (!(Get-Command node -ErrorAction SilentlyContinue)) { throw "Install Node.js 22 LTS or newer, then reopen PowerShell." }
$nodeMajor = [int]((& node -p "process.versions.node.split('.')[0]") | Select-Object -First 1)
if ($nodeMajor -lt 22) { throw "Use Node.js 22 LTS or newer." }
if (!(Test-Path -LiteralPath ".env")) {
    Copy-Item -LiteralPath ".env.example" -Destination ".env"
}
$config = Get-Content -LiteralPath ".env" -Raw
if ($config -notmatch '(?m)^JWT_SECRET=') { $config += "`nJWT_SECRET=""""`n" }
if ($config -match '(?m)^JWT_SECRET="?"?[ \t]*\r?$') {
    $sessionSecret = & node -e "process.stdout.write(require('node:crypto').randomBytes(48).toString('hex'))"
    $config = [regex]::Replace($config, '(?m)^JWT_SECRET="?"?[ \t]*\r?$', ('JWT_SECRET="' + $sessionSecret + '"'))
    [System.IO.File]::WriteAllText((Join-Path $PSScriptRoot ".env"), $config, (New-Object System.Text.UTF8Encoding($false)))
}
if ($config -notmatch '(?m)^DATABASE_URL="?postgres(?:ql)?://[^\r\n]+') {
    Write-Host "A private .env file is ready. Fill DATABASE_URL and your own service settings locally." -ForegroundColor Yellow
    Write-Host "Open it with: notepad .env"
    throw "Database configuration is required. Save .env, then run this script again. Do not send .env to anyone."
}
# Older updates left an inactive middleware file at the repository root.
if (Test-Path -LiteralPath "middleware.ts") {
    Move-Item -LiteralPath "middleware.ts" -Destination ("middleware.ts.backup-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
}
if (!$SkipInstall) { Run-Checked "npm.cmd" @("ci", "--allow-remote=root") }
Run-Checked "npx.cmd" @("--no-install", "prisma", "generate")
Run-Checked "node" @("scripts/check-admin-contracts.cjs")
Run-Checked "node" @("scripts/check-admin.cjs")
Run-Checked "node" @("scripts/check-security.cjs")
Run-Checked "node" @("scripts/check-payment-flows.cjs")
if (!$SkipBuild) { Run-Checked "npm.cmd" @("run", "build") }
Write-Host "Open the Local URL printed below and check /contact and /shop." -ForegroundColor Green
Run-Checked "npm.cmd" @("run", "dev")
