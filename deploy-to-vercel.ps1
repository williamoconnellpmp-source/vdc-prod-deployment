# Quick Vercel Deployment Script
# Run this to deploy PROD to Vercel

Write-Host "`n=== Vercel Deployment Helper ===" -ForegroundColor Cyan
Write-Host "`nThis script will help you deploy to Vercel" -ForegroundColor Gray

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "`n⚠️  Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
} else {
    Write-Host "`n✅ Vercel CLI is installed" -ForegroundColor Green
}

Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "`n1. Login to Vercel:" -ForegroundColor White
Write-Host "   vercel login" -ForegroundColor Cyan
Write-Host "`n2. Deploy from this directory:" -ForegroundColor White
Write-Host "   vercel" -ForegroundColor Cyan
Write-Host "`n3. For production deployment:" -ForegroundColor White
Write-Host "   vercel --prod" -ForegroundColor Cyan
Write-Host "`n📝 Important Environment Variables to set in Vercel Dashboard:" -ForegroundColor Yellow
Write-Host "   NEXT_PUBLIC_VDC_COGNITO_DOMAIN=https://vdc-prod-williamoconnellpmp.auth.us-west-2.amazoncognito.com" -ForegroundColor Gray
Write-Host "   NEXT_PUBLIC_VDC_COGNITO_CLIENT_ID=7qbh0bvokedaou09huur281ti9" -ForegroundColor Gray
Write-Host "   NEXT_PUBLIC_VDC_API_BASE_URL=https://js97cus4h2.execute-api.us-west-2.amazonaws.com" -ForegroundColor Gray
Write-Host "   NEXT_PUBLIC_VDC_REDIRECT_URI=https://YOUR-VERCEL-URL.vercel.app/life-sciences/app/callback" -ForegroundColor Gray
Write-Host "   NEXT_PUBLIC_VDC_LOGOUT_URI=https://YOUR-VERCEL-URL.vercel.app/life-sciences/app/login" -ForegroundColor Gray
Write-Host "`n💡 After first deploy, update the redirect/logout URIs with your actual Vercel URL!" -ForegroundColor Yellow
