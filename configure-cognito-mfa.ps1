# Configure Cognito MFA for All Users
# This script enables MFA and enrolls MFA for all 4 demo accounts
# Date: 2026-01-26

$ErrorActionPreference = "Stop"

# Cognito Configuration
$userPoolId = "us-west-2_aQd9shIdg"
$region = "us-west-2"

# Demo User Emails
$users = @(
    @{ Email = "williamoconnellpmp+submitter1@gmail.com"; Name = "Submitter 1" },
    @{ Email = "williamoconnellpmp+submitter2@gmail.com"; Name = "Submitter 2" },
    @{ Email = "williamoconnellpmp+approver1@gmail.com"; Name = "Approver 1" },
    @{ Email = "williamoconnellpmp+approver2@gmail.com"; Name = "Approver 2" }
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host 'Cognito MFA Configuration Script' -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check current MFA configuration
Write-Host "Step 1: Checking current MFA configuration..." -ForegroundColor Yellow
Write-Host ""

$currentConfigJson = aws cognito-idp describe-user-pool `
    --user-pool-id $userPoolId `
    --region $region `
    --output json 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error checking MFA configuration: $currentConfigJson" -ForegroundColor Red
    Write-Host 'Make sure AWS CLI is configured and you have permissions.' -ForegroundColor Yellow
    exit 1
}

try {
    $currentConfig = $currentConfigJson | ConvertFrom-Json
    $mfaConfig = $currentConfig.UserPool.MfaConfiguration
    Write-Host "Current MFA Configuration: $mfaConfig" -ForegroundColor $(if ($mfaConfig -eq "ON") { "Green" } else { "Yellow" })
    
    if ($mfaConfig -eq "ON") {
        Write-Host "MFA is already enabled!" -ForegroundColor Green
        $enableMfa = Read-Host "Do you want to proceed with MFA enrollment? (y/n)"
        if ($enableMfa -ne "y") {
            Write-Host "Exiting..." -ForegroundColor Yellow
            exit 0
        }
    } else {
        Write-Host "MFA is currently: $mfaConfig" -ForegroundColor Yellow
        Write-Host ""
    }
} catch {
    Write-Host "Error parsing MFA configuration: $_" -ForegroundColor Red
    Write-Host 'Make sure AWS CLI is configured and you have permissions.' -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Enable MFA for all users
if ($mfaConfig -ne "ON") {
    Write-Host "Step 2: Enabling MFA for all users..." -ForegroundColor Yellow
    Write-Host ""
    
    $result = aws cognito-idp set-user-pool-mfa-config `
        --user-pool-id $userPoolId `
        --mfa-configuration ON `
        --software-token-mfa-configuration Enabled=true `
        --region $region 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host '✓ MFA enabled successfully!' -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "✗ Error enabling MFA: $result" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host 'Step 2: Skipping (MFA already enabled)' -ForegroundColor Gray
    Write-Host ""
}

# Step 3: Verify MFA is enabled
Write-Host "Step 3: Verifying MFA configuration..." -ForegroundColor Yellow
Write-Host ""

$verifyConfigJson = aws cognito-idp describe-user-pool `
    --user-pool-id $userPoolId `
    --region $region `
    --output json 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error verifying MFA: $verifyConfigJson" -ForegroundColor Red
    exit 1
}

try {
    $verifyConfig = $verifyConfigJson | ConvertFrom-Json
    $verifiedMfa = $verifyConfig.UserPool.MfaConfiguration
    if ($verifiedMfa -eq "ON") {
        Write-Host '✓ MFA is confirmed ON' -ForegroundColor Green
    } else {
        Write-Host "✗ MFA verification failed. Current: $verifiedMfa" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
} catch {
    Write-Host "✗ Error parsing MFA verification: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Check user status and enroll MFA
Write-Host 'Step 4: Checking user status and preparing for MFA enrollment...' -ForegroundColor Yellow
Write-Host ""
Write-Host 'NOTE: MFA enrollment requires users to be logged in.' -ForegroundColor Yellow
Write-Host 'You have two options:' -ForegroundColor Yellow
Write-Host '  A) Use Admin APIs to set up MFA (requires admin permissions)' -ForegroundColor Cyan
Write-Host '  B) Have users enroll MFA through the app (recommended for demo)' -ForegroundColor Cyan
Write-Host ""
Write-Host 'For demo purposes, users can:' -ForegroundColor Yellow
Write-Host '  1. Log in to the app' -ForegroundColor White
Write-Host '  2. Navigate to their profile/settings' -ForegroundColor White
Write-Host '  3. Enroll MFA using the TOTP secret' -ForegroundColor White
Write-Host ""

# Check each user's current status
Write-Host "Checking user status..." -ForegroundColor Yellow
Write-Host ""

foreach ($user in $users) {
    $userInfoJson = aws cognito-idp admin-get-user `
        --user-pool-id $userPoolId `
        --username $user.Email `
        --region $region `
        --output json 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        try {
            $userInfo = $userInfoJson | ConvertFrom-Json
            if ($userInfo) {
                $mfaEnabled = $userInfo.MFAOptions.Count -gt 0
                $status = $userInfo.UserStatus
                Write-Host "  $($user.Name) ($($user.Email)):" -ForegroundColor White
                Write-Host "    Status: $status" -ForegroundColor $(if ($status -eq "CONFIRMED") { "Green" } else { "Yellow" })
                Write-Host "    MFA Enabled: $(if ($mfaEnabled) { 'Yes' } else { 'No' })" -ForegroundColor $(if ($mfaEnabled) { "Green" } else { "Yellow" })
            }
        } catch {
            Write-Host "  $($user.Name) ($($user.Email)): Error parsing user info - $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  $($user.Name) ($($user.Email)): User not found or error - $userInfoJson" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host '1. MFA is now enabled for the User Pool' -ForegroundColor Green
Write-Host '2. Users need to enroll MFA before they can log in' -ForegroundColor Yellow
Write-Host ""
Write-Host 'To enroll MFA for users:' -ForegroundColor Yellow
Write-Host ""
Write-Host 'Option A - Admin API (if you have admin access):' -ForegroundColor Cyan
Write-Host '  Use: aws cognito-idp admin-set-user-mfa-preference' -ForegroundColor Gray
Write-Host ""
Write-Host 'Option B - User Self-Service (Recommended):' -ForegroundColor Cyan
Write-Host "  1. Users log in (they'll be prompted to enroll MFA)" -ForegroundColor White
Write-Host '  2. Or add MFA enrollment flow to your app' -ForegroundColor White
Write-Host ""
Write-Host 'Option C - Use Admin APIs with TOTP Secret:' -ForegroundColor Cyan
Write-Host '  See: enroll-mfa-admin.ps1 (if created)' -ForegroundColor Gray
Write-Host ""
Write-Host 'After enrollment, update TOTP secrets in:' -ForegroundColor Yellow
Write-Host '  components/TOTPGenerator.jsx' -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
