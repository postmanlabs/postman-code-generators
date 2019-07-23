using System;
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
			request.Content = new StringContent("sdf\": \"\"\n\"12\": \"package.json\"\n\"'123'\": \"'\"23\"4\"\"'", Encoding.UTF8, "text/plain");
			HttpResponseMessage response = await client.SendAsync(request);
			string responseBody = await response.Content.ReadAsStringAsync();
			Console.WriteLine(responseBody);
		}
	}
}
