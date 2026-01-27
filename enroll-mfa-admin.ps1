# Admin MFA Enrollment Script
# This script enrolls MFA for users using Admin APIs
# Date: 2026-01-26

# Don't stop on errors - we'll handle them manually
$ErrorActionPreference = "Continue"

# Cognito Configuration
$userPoolId = "us-west-2_aQd9shIdg"
$clientId = "7qbh0bvokedaou09huur281ti9"
$region = "us-west-2"

# Demo User Emails
$users = @(
    @{ Email = "williamoconnellpmp+submitter1@gmail.com"; Name = "Submitter 1" },
    @{ Email = "williamoconnellpmp+submitter2@gmail.com"; Name = "Submitter 2" },
    @{ Email = "williamoconnellpmp+approver1@gmail.com"; Name = "Approver 1" },
    @{ Email = "williamoconnellpmp+approver2@gmail.com"; Name = "Approver 2" }
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Admin MFA Enrollment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will enroll MFA for users using Admin APIs." -ForegroundColor Yellow
Write-Host "NOTE: This requires admin permissions and the user's password." -ForegroundColor Yellow
Write-Host ""

# Function to enroll MFA for a user
function Enroll-MFAForUser {
    param(
        [string]$Email,
        [string]$Password,
        [string]$UserName
    )
    
    Write-Host "Enrolling MFA for $UserName ($Email)..." -ForegroundColor Yellow
    
    # Step 1: Admin initiate auth to get session
    Write-Host "  Step 1: Initiating admin authentication..." -ForegroundColor Gray
    
    # Capture both stdout and stderr
    $authResponse = & aws cognito-idp admin-initiate-auth `
        --user-pool-id $userPoolId `
        --client-id $clientId `
        --auth-flow ADMIN_NO_SRP_AUTH `
        --auth-parameters "USERNAME=$Email,PASSWORD=$Password" `
        --region $region `
        --output json 2>&1
    
    # Check exit code
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -ne 0 -or $null -eq $authResponse) {
        Write-Host "  [ERROR] AWS CLI Error (Exit Code: $exitCode):" -ForegroundColor Red
        
        # Convert error output to string
        $errorOutput = ""
        if ($null -ne $authResponse) {
            if ($authResponse -is [System.Array]) {
                $errorOutput = $authResponse -join "`n"
            } else {
                $errorOutput = $authResponse.ToString()
            }
        } else {
            $errorOutput = "No response from AWS CLI. Check AWS credentials and permissions."
        }
        
        Write-Host "  Raw Output:" -ForegroundColor Red
        Write-Host "  $errorOutput" -ForegroundColor Red
        
        # Try to parse error if it's JSON
        if ($errorOutput -and $errorOutput.Trim().Length -gt 0) {
            try {
                $errorObj = $errorOutput | ConvertFrom-Json -ErrorAction SilentlyContinue
                if ($errorObj.__type) {
                    Write-Host "  Error Type: $($errorObj.__type)" -ForegroundColor Red
                }
                if ($errorObj.message) {
                    Write-Host "  Error Message: $($errorObj.message)" -ForegroundColor Red
                }
            } catch {
                # Not JSON, that's okay
            }
        }
        
        return $null
    }
    
    # Convert response to string for checking
    if ($null -eq $authResponse) {
        Write-Host "  [ERROR] No response from AWS CLI" -ForegroundColor Red
        return $null
    }
    
    $responseString = if ($authResponse -is [System.Array]) {
        $authResponse -join "`n"
    } else {
        $authResponse.ToString()
    }
    
    # Check if response contains error (even with exit code 0)
    if ($responseString -match '__type' -or $responseString -match '"__type"') {
        Write-Host "  [ERROR] AWS returned an error in response:" -ForegroundColor Red
        Write-Host "  $responseString" -ForegroundColor Red
        return $null
    }
    
    try {
        $authData = $responseString | ConvertFrom-Json
    } catch {
        Write-Host "  [ERROR] Failed to parse JSON response:" -ForegroundColor Red
        Write-Host "  $responseString" -ForegroundColor Red
        return $null
    }
        
        # Check if MFA is already enrolled
        if ($authData.AuthenticationResult) {
            Write-Host "  [WARNING] User already has MFA enrolled or session completed" -ForegroundColor Yellow
            return $null
        }
        
        # Check if we need to set up MFA
        if ($authData.ChallengeName -eq "MFA_SETUP") {
            Write-Host "  [OK] MFA setup required" -ForegroundColor Green
        } else {
            Write-Host "  [WARNING] Unexpected challenge: $($authData.ChallengeName)" -ForegroundColor Yellow
        }
        
        $session = $authData.Session
        
        # Step 2: Associate software token
        Write-Host "  Step 2: Associating software token..." -ForegroundColor Gray
        $associateResponse = aws cognito-idp associate-software-token `
            --session $session `
            --region $region `
            --output json 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ✗ Error associating token: $associateResponse" -ForegroundColor Red
            return $null
        }
        
        $associateData = $associateResponse | ConvertFrom-Json
        $secretCode = $associateData.SecretCode
        $newSession = $associateData.Session
        
        Write-Host "  [OK] Secret code obtained" -ForegroundColor Green
        Write-Host "  Secret: $secretCode" -ForegroundColor Cyan
        
        # Step 3: Generate TOTP code (using a simple method - you may need otplib)
        Write-Host "  Step 3: Generating TOTP code..." -ForegroundColor Gray
        Write-Host "  [INFO] You need to generate a TOTP code from the secret above" -ForegroundColor Yellow
        Write-Host "  Use a TOTP app (Google Authenticator) or online tool" -ForegroundColor Yellow
        Write-Host "  Secret: $secretCode" -ForegroundColor Cyan
        
        $mfaCode = Read-Host "  Enter the 6-digit TOTP code"
        
        # Step 4: Verify software token
        Write-Host "  Step 4: Verifying software token..." -ForegroundColor Gray
        $verifyResponse = aws cognito-idp verify-software-token `
            --user-code $mfaCode `
            --session $newSession `
            --region $region `
            --output json 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  [ERROR] Error verifying token: $verifyResponse" -ForegroundColor Red
            return $null
        }
        
        $verifyData = $verifyResponse | ConvertFrom-Json
        $finalSession = $verifyData.Session
        
        # Step 5: Respond to MFA_SETUP challenge
        Write-Host "  Step 5: Completing MFA setup..." -ForegroundColor Gray
        $respondResponse = aws cognito-idp admin-respond-to-auth-challenge `
            --user-pool-id $userPoolId `
            --client-id $clientId `
            --challenge-name MFA_SETUP `
            --session $finalSession `
            --challenge-responses USERNAME=$Email `
            --region $region `
            --output json 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ✗ Error completing setup: $respondResponse" -ForegroundColor Red
            return $null
        }
        
        Write-Host "  [OK] MFA enrollment completed!" -ForegroundColor Green
        
        return @{
            Success = $true
            Secret = $secretCode
            Email = $Email
        }
}

# Main enrollment process
Write-Host "Starting MFA enrollment for all users..." -ForegroundColor Yellow
Write-Host ""

$enrollmentResults = @()

foreach ($user in $users) {
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    Write-Host "$($user.Name) - $($user.Email)" -ForegroundColor White
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    
    # Get password from user
    $securePassword = Read-Host "Enter password for $($user.Email)" -AsSecureString
    $password = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    )
    
    $result = Enroll-MFAForUser -Email $user.Email -Password $password -UserName $user.Name
    
    if ($result) {
        $enrollmentResults += $result
        Write-Host ""
    } else {
        Write-Host "  [WARNING] Enrollment failed or skipped for $($user.Name)" -ForegroundColor Yellow
        Write-Host ""
    }
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Enrollment Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($enrollmentResults.Count -gt 0) {
    Write-Host "Successfully enrolled MFA for $($enrollmentResults.Count) user(s):" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "TOTP Secrets (save these for TOTPGenerator.jsx):" -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($result in $enrollmentResults) {
        Write-Host "  $($result.Email):" -ForegroundColor White
        Write-Host "    Secret: $($result.Secret)" -ForegroundColor Cyan
    }
    
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Update components/TOTPGenerator.jsx with the secrets above" -ForegroundColor White
    Write-Host "2. Test login for each user" -ForegroundColor White
    Write-Host "3. Verify MFA codes work correctly" -ForegroundColor White
} else {
    Write-Host "No users were enrolled. Check errors above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
