# Fix S3 CORS configuration for document uploads
# This allows browser uploads from localhost:8080 and production domains

$ErrorActionPreference = "Stop"
$env:AWS_DEFAULT_REGION = "us-west-2"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "S3 CORS Configuration Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the bucket name from CloudFormation stack outputs
$StackName = "vdc-prod-app"
Write-Host "Getting bucket name from stack: $StackName" -ForegroundColor Yellow

$BucketName = aws cloudformation describe-stacks `
  --stack-name $StackName `
  --query "Stacks[0].Outputs[?OutputKey=='DocsBucketName'].OutputValue" `
  --output text `
  --region us-west-2

if (-not $BucketName -or $BucketName -eq "None") {
  Write-Host "[ERROR] Could not find DocsBucketName output from stack $StackName" -ForegroundColor Red
  Write-Host "Please check the stack name and ensure it exists." -ForegroundColor Yellow
  exit 1
}

Write-Host "Found bucket: $BucketName" -ForegroundColor Green
Write-Host ""

# Create CORS configuration JSON
$CorsConfig = @{
  CORSRules = @(
    @{
      AllowedHeaders = @("*")
      AllowedMethods = @("GET", "PUT", "POST", "HEAD")
      AllowedOrigins = @(
        "http://localhost:3000",
        "http://localhost:8080",
        "https://williamoconnellpmp.com",
        "https://*.vercel.app"
      )
      ExposeHeaders = @(
        "ETag",
        "x-amz-server-side-encryption",
        "x-amz-request-id",
        "x-amz-id-2"
      )
      MaxAgeSeconds = 3600
    }
  )
} | ConvertTo-Json -Depth 10

# Save to temp file (without BOM to avoid AWS CLI parsing issues)
$TempFile = "cors-config-temp.json"
# Use UTF8NoBOM to avoid BOM that breaks AWS CLI
$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $false
$FullPath = Join-Path $PWD $TempFile
[System.IO.File]::WriteAllText($FullPath, $CorsConfig, $Utf8NoBomEncoding)

Write-Host "Applying CORS configuration..." -ForegroundColor Yellow
Write-Host "CORS Config:" -ForegroundColor Gray
Write-Host $CorsConfig -ForegroundColor Gray
Write-Host ""

# Apply CORS configuration
try {
  # Convert Windows path to file:// URL format for AWS CLI
  $FileUri = "file://" + ($FullPath -replace '\\', '/')
  
  aws s3api put-bucket-cors `
    --bucket $BucketName `
    --cors-configuration $FileUri `
    --region us-west-2

  if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] CORS configuration applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verifying configuration..." -ForegroundColor Yellow
    
    $CurrentCors = aws s3api get-bucket-cors `
      --bucket $BucketName `
      --region us-west-2 `
      --output json
    
    if ($LASTEXITCODE -eq 0) {
      Write-Host "[OK] Current CORS configuration:" -ForegroundColor Green
      Write-Host $CurrentCors -ForegroundColor Gray
    } else {
      Write-Host "[WARNING] Could not verify CORS configuration" -ForegroundColor Yellow
    }
  } else {
    Write-Host "[ERROR] Failed to apply CORS configuration" -ForegroundColor Red
    exit 1
  }
} catch {
  Write-Host "[ERROR] Error applying CORS configuration: $_" -ForegroundColor Red
  exit 1
} finally {
  # Cleanup temp file
  Remove-Item $FullPath -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Try uploading a document again" -ForegroundColor White
Write-Host "2. The CORS error should be resolved" -ForegroundColor White
Write-Host "3. If issues persist, check browser console for details" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
