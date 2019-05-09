require "uri"
require "net/http"

url = URI("https://8cf6f433-4274-41e1-a763-cf45262ecd57.mock.pstmn.io/testcopy")

https = Net::HTTP.new(url.host, url.port)
https.use_ssl = true

request = Net::HTTP::Copy.new(url)

response = https.request(request)
puts response.read_body
