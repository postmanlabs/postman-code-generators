library(RCurl)
headers = c(
  "Content-Type" = "application/x-www-form-urlencoded"
)
params = "<file contents here>";
res <- postForm("https://postman-echo.com/post", .opts=list(httpheader=headers, postfields=params), style = "post")
print(res)