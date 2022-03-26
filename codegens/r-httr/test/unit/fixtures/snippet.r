library(httr)
headers = c(
  'Content-Type' = 'application/x-www-form-urlencoded'
)
body = upload_file('<file contents here>')
res <- POST("https://postman-echo.com/post", body = body, add_headers(headers))
cat(content(res, 'text'))