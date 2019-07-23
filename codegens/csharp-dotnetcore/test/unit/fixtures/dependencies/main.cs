using System;
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
			HttpRequestMessage request = new HttpRequestMessage(new HttpMethod("POST"), "https://postman-echo.com/post/?hardik=\"me\"");
			MultipartFormDataContent requestContent = new MultipartFormDataContent();
			StringContent formDataEntry;
			formDataEntry = new StringContent("a");
			formDataEntry.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data") { Name = "1"};
			requestContent.Add(formDataEntry);
			formDataEntry = new StringContent("b");
			formDataEntry.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data") { Name = "2"};
			requestContent.Add(formDataEntry);
			formDataEntry = new StringContent("\"23\"");
			formDataEntry.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data") { Name = "\"\"12\"\""};
			requestContent.Add(formDataEntry);
			formDataEntry = new StringContent("'1\"23\"4'");
			formDataEntry.Headers.ContentDisposition = new ContentDispositionHeaderValue("form-data") { Name = "'1\"2\\\"\"3'"};
			requestContent.Add(formDataEntry);
			HttpResponseMessage response = await client.SendAsync(request);
			string responseBody = await response.Content.ReadAsStringAsync();
			Console.WriteLine(responseBody);
		}
	}
}
