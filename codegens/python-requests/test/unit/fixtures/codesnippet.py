import requests

url = "https://9c76407d-5b8d-4b22-99fb-8c47a85d9848.mock.pstmn.io"

payload = {}
headers= {}

response = requests.request("COPY", url, headers=headers, data = payload)

print(response.text.encode('utf8'))
