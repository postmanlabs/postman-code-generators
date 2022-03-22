library(RCurl)
headers = c(
  "Content-Type" = "application/json"
)
params = "{
  \"json\": \"Test-Test\"
}"
res <- postForm("https://postman-echo.com/post", .opts=list(httpheader=headers, postfields=params), style = "post")
print(res)