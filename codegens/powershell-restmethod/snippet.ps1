$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Content-Type", 'application/x-www-form-urlencoded')

$body = "1=a&2=b&%22%2212%22%22=%2223%22&%271%222%5C%22%223%27=%271%2223%224%27"

$response = Invoke-RestMethod 'https://mockbin.org/request?hardik="me"' -Method 'POST' -Headers $headers -Body $body -TimeoutSec 10
$response | ConvertTo-Json