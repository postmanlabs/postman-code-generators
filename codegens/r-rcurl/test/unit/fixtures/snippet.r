library(RCurl)
headers = c(
  "my-sample-header" = "Lorem ipsum dolor sit amet",
  "testing" = "'singlequotes'",
  "TEST" = "\"doublequotes\""
)
res <- getURL("https://postman-echo.com/headers", httpheader = headers)
print(res)