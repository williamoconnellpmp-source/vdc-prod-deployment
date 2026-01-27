# Check Lambda function logs for upload-init and submit errors
# This helps diagnose 500 errors from the API

$ErrorActionPreference = "Stop"
$env:AWS_DEFAULT_REGION = "us-west-2"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Lambda Function Logs Checker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Lambda function names
$Functions = @(
  "vdc-upload-init-prod",
  "vdc-submit-prod"
)

foreach ($FunctionName in $Functions) {
  Write-Host "Checking logs for: $FunctionName" -ForegroundColor Yellow
  Write-Host "----------------------------------------" -ForegroundColor Gray
  
  # Get the log group name
  $LogGroup = "/aws/lambda/$FunctionName"
  
  # Get recent log streams (last 5 minutes)
  $StartTime = (Get-Date).AddMinutes(-5).ToUniversalTime()
  $StartTimeUnix = [Math]::Floor((New-TimeSpan -Start (Get-Date "1970-01-01") -End $StartTime).TotalSeconds) * 1000
  
  try {
    # Get recent log streams
    $LogStreams = aws logs describe-log-streams `
      --log-group-name $LogGroup `
      --order-by LastEventTime `
      --descending `
      --max-items 3 `
      --region us-west-2 `
      --output json | ConvertFrom-Json
    
    if ($LogStreams.logStreams -and $LogStreams.logStreams.Count -gt 0) {
      $LatestStream = $LogStreams.logStreams[0]
      Write-Host "Latest log stream: $($LatestStream.logStreamName)" -ForegroundColor Green
      Write-Host "Last event: $($LatestStream.lastEventTime)" -ForegroundColor Gray
      Write-Host ""
      
      # Get recent log events
      Write-Host "Recent log events:" -ForegroundColor Yellow
      $LogEvents = aws logs get-log-events `
        --log-group-name $LogGroup `
        --log-stream-name $LatestStream.logStreamName `
        --limit 20 `
        --start-from-head `
        --region us-west-2 `
        --output json | ConvertFrom-Json
      
      if ($LogEvents.events -and $LogEvents.events.Count -gt 0) {
        foreach ($Event in $LogEvents.events) {
          $Timestamp = [DateTimeOffset]::FromUnixTimeMilliseconds($Event.timestamp).LocalDateTime
          $Message = $Event.message
          
          # Highlight errors
          if ($Message -match "ERROR|Exception|Traceback|Error|Failed") {
            Write-Host "[$Timestamp] " -ForegroundColor Red -NoNewline
            Write-Host $Message -ForegroundColor Red
          } else {
            Write-Host "[$Timestamp] " -ForegroundColor Gray -NoNewline
            Write-Host $Message -ForegroundColor White
          }
        }
      } else {
        Write-Host "No recent log events found" -ForegroundColor Yellow
      }
    } else {
      Write-Host "[WARNING] No log streams found for $FunctionName" -ForegroundColor Yellow
      Write-Host "The function may not have been invoked recently, or logs may not exist yet." -ForegroundColor Gray
    }
  } catch {
    Write-Host "[ERROR] Could not retrieve logs for $FunctionName" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
  }
  
  Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Tips:" -ForegroundColor Yellow
Write-Host "1. Look for 'ERROR', 'Exception', or 'Traceback' messages" -ForegroundColor White
Write-Host "2. Check for missing environment variables or permissions" -ForegroundColor White
Write-Host "3. Verify the Lambda function code is deployed correctly" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
