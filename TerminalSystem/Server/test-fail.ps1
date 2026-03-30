$body = @{ ContainerId='CONTAINER-FAIL2'; BayId=8; Status='Failed'; CustomOfficerName='John'; InspectionType='Full'; AdditionalCharges=0; WharfClerkId='WC'; WharfClerkName='Clerk' } | ConvertTo-Json
try {
    $r = Invoke-RestMethod -Uri http://localhost:5047/api/Inspections/submit -Method Post -Body $body -ContentType application/json
    $r | ConvertTo-Json | Out-File error.log -Encoding UTF8
} catch {
    $s = $_.Exception.Response.GetResponseStream()
    $rd = New-Object System.IO.StreamReader($s)
    $rd.ReadToEnd() | Out-File error.log -Encoding UTF8
}
