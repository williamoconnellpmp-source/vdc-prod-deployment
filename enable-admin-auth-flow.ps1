# Enable ADMIN_NO_SRP_AUTH flow for Cognito App Client
# This is required for admin-initiated MFA enrollment

$userPoolId = "us-west-2_aQd9shIdg"
$clientId = "7qbh0bvokedaou09huur281ti9"
$region = "us-west-2"

Write-Host "Enabling ADMIN_NO_SRP_AUTH flow for App Client..." -ForegroundColor Yellow
Write-Host ""

# Get current client configuration
Write-Host "Step 1: Getting current App Client configuration..." -ForegroundColor Gray
$currentConfig = aws cognito-idp describe-user-pool-client `
    --user-pool-id $userPoolId `
    --client-id $clientId `
    --region $region `
    --output json 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to get current configuration:" -ForegroundColor Red
    Write-Host $currentConfig -ForegroundColor Red
    exit 1
}

$clientData = $currentConfig | ConvertFrom-Json
$currentFlows = $clientData.UserPoolClient.ExplicitAuthFlows

Write-Host "Current Auth Flows: $($currentFlows -join ', ')" -ForegroundColor Cyan
Write-Host ""

# Check if ADMIN_NO_SRP_AUTH is already enabled
if ($currentFlows -contains "ADMIN_NO_SRP_AUTH") {
    Write-Host "[OK] ADMIN_NO_SRP_AUTH is already enabled!" -ForegroundColor Green
    exit 0
}

# Add ADMIN_NO_SRP_AUTH to the list
$newFlows = @($currentFlows) + @("ADMIN_NO_SRP_AUTH")
$newFlows = $newFlows | Select-Object -Unique

Write-Host "Step 2: Updating App Client with new auth flows..." -ForegroundColor Gray
Write-Host "New Auth Flows: $($newFlows -join ', ')" -ForegroundColor Cyan
Write-Host ""

# Update the client
# Note: We need to preserve all existing settings
$updateParams = @{
    UserPoolId = $userPoolId
    ClientId = $clientId
    ExplicitAuthFlows = $newFlows
    Region = $region
}

# Build the update command with all required parameters
$updateCmd = "aws cognito-idp update-user-pool-client " +
    "--user-pool-id $userPoolId " +
    "--client-id $clientId " +
    "--explicit-auth-flows " + ($newFlows -join " ") +
    " --region $region"

Write-Host "Running update command..." -ForegroundColor Gray
$updateResult = Invoke-Expression $updateCmd 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to update App Client:" -ForegroundColor Red
    Write-Host $updateResult -ForegroundColor Red
    Write-Host ""
    Write-Host "You may need to update this manually via AWS Console or use a more complete update command." -ForegroundColor Yellow
    Write-Host "The update command needs to include ALL existing client settings." -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] App Client updated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "ADMIN_NO_SRP_AUTH flow is now enabled." -ForegroundColor Green
Write-Host "You can now run enroll-mfa-admin.ps1" -ForegroundColor Cyan
