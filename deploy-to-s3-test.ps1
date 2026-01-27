# Deploy PROD to S3 for Testing
# This creates a separate test bucket that won't interfere with DEV

param(
    [string]$BucketName = ""
)

$ErrorActionPreference = "Stop"

Write-Host "`n=== PROD S3 Test Deployment ===" -ForegroundColor Cyan
Write-Host "⚠️  This will create a NEW test bucket - DEV will NOT be touched" -ForegroundColor Yellow

# Generate unique bucket name if not provided
if ([string]::IsNullOrEmpty($BucketName)) {
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $BucketName = "vdc-prod-test-${timestamp}-391611737316-us-west-2"
    Write-Host "`nGenerated bucket name: $BucketName" -ForegroundColor Green
}

$Region = "us-west-2"
$OutDir = "out"

# Check if out directory exists
if (-not (Test-Path $OutDir)) {
    Write-Host "`n❌ Error: 'out' directory not found. Run 'npm run build' first!" -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 Deployment Steps:" -ForegroundColor Yellow
Write-Host "1. Create S3 bucket" -ForegroundColor White
Write-Host "2. Enable static website hosting" -ForegroundColor White
Write-Host "3. Upload files" -ForegroundColor White
Write-Host "4. Set bucket policy" -ForegroundColor White
Write-Host "5. Get website URL" -ForegroundColor White

# Step 1: Create bucket
Write-Host "`n[1/5] Creating S3 bucket..." -ForegroundColor Cyan
try {
    aws s3 mb "s3://$BucketName" --region $Region 2>&1 | Out-Null
    Write-Host "✅ Bucket created: $BucketName" -ForegroundColor Green
} catch {
    # Bucket might already exist
    Write-Host "⚠️  Bucket may already exist, continuing..." -ForegroundColor Yellow
}

# Step 2: Enable static website hosting
Write-Host "`n[2/5] Enabling static website hosting..." -ForegroundColor Cyan
$websiteConfig = @{
    IndexDocument = "index.html"
    ErrorDocument = "404.html"
} | ConvertTo-Json

aws s3api put-bucket-website `
    --bucket $BucketName `
    --website-configuration $websiteConfig `
    --region $Region | Out-Null

Write-Host "✅ Static website hosting enabled" -ForegroundColor Green

# Step 3: Upload files
Write-Host "`n[3/5] Uploading files to S3..." -ForegroundColor Cyan
aws s3 sync $OutDir "s3://$BucketName" `
    --delete `
    --region $Region `
    --exclude "*.map" `
    --exclude ".DS_Store" `
    --exclude "Thumbs.db"

Write-Host "✅ Files uploaded" -ForegroundColor Green

# Step 4: Set bucket policy
Write-Host "`n[4/5] Setting bucket policy..." -ForegroundColor Cyan
$policy = @{
    Version = "2012-10-17"
    Statement = @(
        @{
            Sid = "PublicReadGetObject"
            Effect = "Allow"
            Principal = "*"
            Action = "s3:GetObject"
            Resource = "arn:aws:s3:::$BucketName/*"
        }
    )
} | ConvertTo-Json -Depth 10

$policy | Out-File -FilePath "$env:TEMP\s3-policy.json" -Encoding UTF8
aws s3api put-bucket-policy `
    --bucket $BucketName `
    --policy "file://$env:TEMP\s3-policy.json" `
    --region $Region | Out-Null

Remove-Item "$env:TEMP\s3-policy.json" -ErrorAction SilentlyContinue
Write-Host "✅ Bucket policy set - public read for testing" -ForegroundColor Green

# Step 5: Get website URL
Write-Host "`n[5/5] Getting website URL..." -ForegroundColor Cyan
$WebsiteUrl = "http://$BucketName.s3-website-$Region.amazonaws.com"
$WebsiteUrlHttps = "https://$BucketName.s3-website-$Region.amazonaws.com"

Write-Host "`n✅ Deployment Complete!" -ForegroundColor Green
Write-Host "`n📋 Your Test URLs:" -ForegroundColor Yellow
Write-Host "   HTTP:  $WebsiteUrl" -ForegroundColor Cyan
Write-Host "   HTTPS: $WebsiteUrlHttps" -ForegroundColor Cyan
Write-Host "`n🔒 Security:" -ForegroundColor Yellow
Write-Host "   - Bucket name is unique and hard to guess" -ForegroundColor Gray
Write-Host "   - Users won't find this unless they have the exact URL" -ForegroundColor Gray
Write-Host "   - DEV bucket is completely separate and untouched" -ForegroundColor Gray

Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Test the login flow at: $WebsiteUrl/life-sciences/app/login" -ForegroundColor White
Write-Host "2. Update Cognito callback URL with this test URL" -ForegroundColor White
Write-Host "3. After full testing, you can deploy to production" -ForegroundColor White

Write-Host "`n💡 To update Cognito, run:" -ForegroundColor Yellow
Write-Host "aws cognito-idp update-user-pool-client ``" -ForegroundColor Cyan
Write-Host "  --user-pool-id us-west-2_aQd9shIdg ``" -ForegroundColor Cyan
Write-Host "  --client-id 7qbh0bvokedaou09huur281ti9 ``" -ForegroundColor Cyan
Write-Host "  --callback-urls `"https://williamoconnellpmp.com/life-sciences/app/callback/`" `"$WebsiteUrl/life-sciences/app/callback/`" ``" -ForegroundColor Cyan
Write-Host "  --logout-urls `"https://williamoconnellpmp.com/life-sciences/app/login/`" `"$WebsiteUrl/life-sciences/app/login/`" ``" -ForegroundColor Cyan
Write-Host "  --region us-west-2" -ForegroundColor Cyan

Write-Host "`n✅ Safe to test! DEV is completely untouched." -ForegroundColor Green
