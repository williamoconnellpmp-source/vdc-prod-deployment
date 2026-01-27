# Quick test script to verify TOTP code generation
# This helps diagnose if the issue is with code generation or the secret

param(
    [string]$Secret = "2CLDKWW5T7YNDM3SUEEUKUYMENBU7P72SW7VQFONBRX6WMM7VWGA"
)

Write-Host "Testing TOTP Code Generation" -ForegroundColor Cyan
Write-Host "Secret: $Secret" -ForegroundColor Gray
Write-Host ""

# Check if Node.js is available
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Create a temporary test script
$testScript = @"
const { authenticator } = require('otplib');

// Configure for Cognito
authenticator.options = {
  digits: 6,
  step: 30,
  algorithm: 'sha1',
  encoding: 'base32'
};

const secret = '$Secret';
const code = authenticator.generate(secret);

console.log('Generated TOTP Code:', code);
console.log('Code Length:', code.length);
console.log('Is Valid Format:', /^\d{6}$/.test(code));
"@

$testScript | Out-File -FilePath "test-totp-temp.js" -Encoding UTF8

Write-Host "Running TOTP generation test..." -ForegroundColor Yellow
$result = node test-totp-temp.js 2>&1

Write-Host ""
Write-Host "Result:" -ForegroundColor Cyan
Write-Host $result

# Cleanup
Remove-Item "test-totp-temp.js" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Copy the generated code above" -ForegroundColor White
Write-Host "2. Try logging in with that code" -ForegroundColor White
Write-Host "3. If it works, the issue is with the React component" -ForegroundColor White
Write-Host "4. If it doesn't work, check:" -ForegroundColor White
Write-Host "   - System time is correct" -ForegroundColor Gray
Write-Host "   - Secret matches Cognito" -ForegroundColor Gray
Write-Host "   - Code is used within 30 seconds" -ForegroundColor Gray
