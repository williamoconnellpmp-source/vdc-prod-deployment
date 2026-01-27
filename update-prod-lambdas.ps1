# Force update PROD Lambda functions with code from S3 artifacts bucket
# This fixes cases where Lambda functions have stale or missing code

$ErrorActionPreference = "Stop"
$env:AWS_DEFAULT_REGION = "us-west-2"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Update PROD Lambda Functions" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ArtifactsBucket = "vdc-cfn-artifacts-391611737316-usw2"
$ArtifactsPrefix = "vdc/prod"

# PROD Lambda functions and their corresponding ZIP files
$LambdaMappings = @{
  "vdc-upload-init-prod" = "vdc-upload-init.zip"
  "vdc-submit-prod" = "vdc-submit.zip"
  "vdc-approvals-pending-prod" = "vdc-approvals-pending.zip"
  "vdc-approve-prod" = "vdc-approve.zip"
  "vdc-reject-prod" = "vdc-reject.zip"
  "vdc-download-prod" = "vdc-download.zip"
  "vdc-documents-list-prod" = "vdc-documents-list.zip"
  "vdc-document-audit-prod" = "vdc-document-audit.zip"
}

foreach ($FunctionName in $LambdaMappings.Keys) {
  $ZipFile = $LambdaMappings[$FunctionName]
  $S3Key = "$ArtifactsPrefix/$ZipFile"
  
  Write-Host "Updating: $FunctionName" -ForegroundColor Yellow
  Write-Host "  S3 Location: s3://$ArtifactsBucket/$S3Key" -ForegroundColor Gray
  
  # Check if ZIP exists in S3
  $ZipExists = aws s3 ls "s3://$ArtifactsBucket/$S3Key" --region us-west-2 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] ZIP file not found in S3: $S3Key" -ForegroundColor Red
    Write-Host "  Skipping..." -ForegroundColor Yellow
    Write-Host ""
    continue
  }
  
  # Update Lambda function code
  try {
    $Result = aws lambda update-function-code `
      --function-name $FunctionName `
      --s3-bucket $ArtifactsBucket `
      --s3-key $S3Key `
      --region us-west-2 `
      --output json | ConvertFrom-Json
    
    if ($Result.LastUpdateStatus -eq "InProgress" -or $Result.LastUpdateStatus -eq "Successful") {
      Write-Host "  [OK] Update initiated successfully" -ForegroundColor Green
      Write-Host "  LastUpdateStatus: $($Result.LastUpdateStatus)" -ForegroundColor Gray
      Write-Host "  CodeSize: $($Result.CodeSize) bytes" -ForegroundColor Gray
    } else {
      Write-Host "  [WARNING] Unexpected status: $($Result.LastUpdateStatus)" -ForegroundColor Yellow
    }
  } catch {
    Write-Host "  [ERROR] Failed to update function: $_" -ForegroundColor Red
  }
  
  Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Waiting for updates to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Checking function status..." -ForegroundColor Yellow
foreach ($FunctionName in $LambdaMappings.Keys) {
  try {
    $Status = aws lambda get-function `
      --function-name $FunctionName `
      --query "Configuration.[LastUpdateStatus,CodeSize]" `
      --output text `
      --region us-west-2
    
    if ($LASTEXITCODE -eq 0) {
      $Parts = $Status -split "`t"
      Write-Host "$FunctionName : $($Parts[0]) ($($Parts[1]) bytes)" -ForegroundColor $(if ($Parts[0] -eq "Successful") { "Green" } else { "Yellow" })
    }
  } catch {
    Write-Host "$FunctionName : [ERROR] Could not check status" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Green
Write-Host "If any functions show 'InProgress', wait a few seconds and check again." -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
