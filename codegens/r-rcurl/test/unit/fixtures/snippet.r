library(RCurl)
headers = c(
  "Content-Type" = "application/x-www-form-urlencoded"
)
params = "<file contents here>";
res <- postForm("https://postman-echo.com/post", .opts=list(postfields = params, httpheader = headers, timeout.ms = 5000), style = "post")
print(res)