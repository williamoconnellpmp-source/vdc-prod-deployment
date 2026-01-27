# Simple S3 Deployment Script
# Deploys PROD to a new test bucket

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$BucketName = "vdc-prod-test-$timestamp-391611737316-us-west-2"
$Region = "us-west-2"
$OutDir = "out"

Write-Host ""
Write-Host "=== PROD S3 Test Deployment ===" -ForegroundColor Cyan
Write-Host "Bucket: $BucketName" -ForegroundColor Yellow
Write-Host ""

# Check if out directory exists
if (-not (Test-Path $OutDir)) {
    Write-Host "ERROR: 'out' directory not found. Run 'npm run build' first!" -ForegroundColor Red
    exit 1
}

# Step 1: Create bucket
Write-Host "[1/5] Creating bucket..." -ForegroundColor Cyan
aws s3 mb "s3://$BucketName" --region $Region
if ($LASTEXITCODE -ne 0) {
    Write-Host "Bucket may already exist, continuing..." -ForegroundColor Yellow
}

# Step 2: Enable static website hosting
Write-Host "[2/5] Enabling static website hosting..." -ForegroundColor Cyan
$config = '{"IndexDocument":{"Suffix":"index.html"},"ErrorDocument":{"Key":"404.html"}}'
aws s3api put-bucket-website --bucket $BucketName --website-configuration $config --region $Region

# Step 3: Upload files
Write-Host "[3/5] Uploading files..." -ForegroundColor Cyan
aws s3 sync $OutDir "s3://$BucketName" --delete --region $Region --exclude "*.map" --exclude ".DS_Store" --exclude "Thumbs.db"

# Step 4: Set bucket policy
Write-Host "[4/5] Setting bucket policy..." -ForegroundColor Cyan
$policy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BucketName/*"
    }
  ]
}
"@
$policy | Out-File -FilePath "$env:TEMP\s3-policy.json" -Encoding UTF8
aws s3api put-bucket-policy --bucket $BucketName --policy "file://$env:TEMP\s3-policy.json" --region $Region
Remove-Item "$env:TEMP\s3-policy.json" -ErrorAction SilentlyContinue

# Step 5: Display URL
Write-Host "[5/5] Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Green
Write-Host ""
$WebsiteUrl = "http://$BucketName.s3-website-$Region.amazonaws.com"
Write-Host "Test URL: $WebsiteUrl" -ForegroundColor Cyan
Write-Host "Login: $WebsiteUrl/life-sciences/app/login" -ForegroundColor Cyan
Write-Host ""
Write-Host "To update Cognito, run:" -ForegroundColor Yellow
Write-Host "aws cognito-idp update-user-pool-client --user-pool-id us-west-2_aQd9shIdg --client-id 7qbh0bvokedaou09huur281ti9 --callback-urls `"https://williamoconnellpmp.com/life-sciences/app/callback/`" `"$WebsiteUrl/life-sciences/app/callback/`" --logout-urls `"https://williamoconnellpmp.com/life-sciences/app/login/`" `"$WebsiteUrl/life-sciences/app/login/`" --region us-west-2" -ForegroundColor Gray
Write-Host ""
