using System;
using System.IO;
using System.Net.Http;
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
			FileStream filestream12 = File.OpenRead("package.json");
			StreamContent filedata12 = new StreamContent(filestream12);
			filedata12.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("form-data") {Name = "12", FileName = "package.json"};
			filedata12.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");
			requestContent.Add(filedata12);
			request.Content = requestContent;
			HttpResponseMessage response = await client.SendAsync(request);
			string responseBody = await response.Content.ReadAsStringAsync();
			Console.WriteLine(responseBody);
		}
	}
}
