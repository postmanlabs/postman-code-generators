using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
namespace HttpRequests {
class Program {
static void Main(string[] args) {
Request().Wait();
}
static async Task Request() {
HttpClientHandler clientHandler = new HttpClientHandler();
HttpClient client = new HttpClient(clientHandler);
client.Timeout = TimeSpan.FromMilliseconds(5000);
HttpRequestMessage request = new HttpRequestMessage(new HttpMethod("POST"), "https://postman-echo.com/post");
MultipartFormDataContent requestContent = new MultipartFormDataContent();
IList<KeyValuePair<string, string>> formData = new List<KeyValuePair<string, string>>();
formData.Add(new KeyValuePair<string, string>("sdf", ""));
requestContent.Add(new StreamContent(File.OpenRead("package.json")), "12", "package.json");
formData.Add(new KeyValuePair<string, string>("'123'", "'\"23\"4\"\"'"));
FormUrlEncodedContent formContent = new FormUrlEncodedContent(formData);
requestContent.Add(formContent);
request.Content = requestContent;
HttpResponseMessage response = await client.SendAsync(request);
string responseBody = await response.Content.ReadAsStringAsync();
Console.WriteLine(responseBody);
}
}
}
