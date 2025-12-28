param(
  [string]$UnitCode = "TEST-UNIT-01"
)

function Write-Info($msg) { Write-Host $msg }
function Write-Err($msg) { Write-Host $msg -ForegroundColor Red }

$uriBase = "http://localhost:3000"
$postUri = "$uriBase/api/units"

$bodyObj = @{
  unitCode = $UnitCode
  floor = 4
  totalAreaSqft = 600
  sizeCategory = "1BR"
  quality = "Premium"
  viewType = "Sea View"
  ownershipAllowed = "Both"
  status = "Available"
  maxShares = 10
  basePrice = 100000
  pricePerSqft = 200
  viewMarkupPercent = 5
  qualityMarkupPercent = 10
  floorMarkupPercent = 2
}

$json = $bodyObj | ConvertTo-Json

Write-Info "Posting unit $UnitCode to $postUri ..."
try {
  $resp = Invoke-RestMethod -Uri $postUri -Method POST -ContentType "application/json" -Body $json
} catch {
  Write-Err "Failed to POST unit. Ensure dev server is running (npm run dev) and MONGODB_URI is configured."
  Write-Err $_.Exception.Message
  exit 1
}

if (-not $resp.ok) {
  Write-Err "Server returned error: $($resp.error)"
  exit 1
}

$id = $resp.data._id
Write-Info "Created unit with id: $id"
Write-Info "Computed finalPrice: $($resp.data.finalPrice) ; timeSharePrice: $($resp.data.timeSharePrice)"

$getUri = "$uriBase/api/units/$id"
Write-Info "Fetching unit from $getUri ..."
try {
  $getResp = Invoke-RestMethod -Uri $getUri -Method GET
} catch {
  Write-Err "Failed to GET unit: $id"
  Write-Err $_.Exception.Message
  exit 1
}

Write-Info "Unit fetched:"
Write-Host ("unitCode: " + $getResp.data.unitCode)
Write-Host ("ownershipAllowed: " + $getResp.data.ownershipAllowed)
Write-Host ("finalPrice: " + $getResp.data.finalPrice)
Write-Host ("timeSharePrice: " + $getResp.data.timeSharePrice)

Write-Info "Check complete."
