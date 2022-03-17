library(RCurl)
headers = c(
  "Content-Type" = "text/xml"
)
res <- postForm("https://postman-echo.com/post", .params = p, .opts=list(httpheader=headers), style = "")
print(res)