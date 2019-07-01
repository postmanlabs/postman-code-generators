import http.client
conn = http.client.HTTPSConnection("9c76407d-5b8d-4b22-99fb-8c47a85d9848.mock.pstmn.io")
payload = ''
headers = {}
conn.request("COPY", "", payload, headers)
res = conn.getresponse()
data = res.read()
print(data.decode("utf-8"))