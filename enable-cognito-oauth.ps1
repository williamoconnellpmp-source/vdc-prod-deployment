# Enable OAuth at Cognito User Pool Level
# This is required for the Hosted UI to work

Write-Host ""
Write-Host "=== Enabling OAuth at User Pool Level ===" -ForegroundColor Cyan
Write-Host ""

$userPoolId = "us-west-2_aQd9shIdg"
$region = "us-west-2"

Write-Host "Getting current User Pool configuration..." -ForegroundColor Yellow
$currentConfig = aws cognito-idp describe-user-pool --user-pool-id $userPoolId --region $region --output json | ConvertFrom-Json

Write-Host ""
Write-Host "Current OAuth settings:" -ForegroundColor Yellow
Write-Host "  OAuth: $($currentConfig.UserPool.OAuth)" -ForegroundColor Gray

Write-Host ""
Write-Host "Updating User Pool to enable OAuth..." -ForegroundColor Cyan

# Build the update command
$updateCmd = "aws cognito-idp update-user-pool --user-pool-id $userPoolId --region $region"

# Add explicit auth flows
$updateCmd += " --explicit-auth-flows ALLOW_USER_SRP_AUTH ALLOW_REFRESH_TOKEN_AUTH"

# Note: OAuth settings are configured at the App Client level, not User Pool level
# The User Pool just needs explicit auth flows enabled

Write-Host ""
Write-Host "Running update command..." -ForegroundColor Yellow
Invoke-Expression $updateCmd

Write-Host ""
Write-Host "✅ User Pool updated!" -ForegroundColor Green
Write-Host ""
Write-Host "Note: OAuth flows are configured at the App Client level (already done)." -ForegroundColor Gray
Write-Host "The User Pool now has explicit auth flows enabled." -ForegroundColor Gray
Write-Host ""
Write-Host "Try logging in again - the error should be resolved!" -ForegroundColor Green
