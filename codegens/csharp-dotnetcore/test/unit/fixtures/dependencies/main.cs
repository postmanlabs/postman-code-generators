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
			HttpRequestMessage request = new HttpRequestMessage(new HttpMethod("POST"), "https://postman-echo.com/post/?hardik=\"me\"");
			request.Content = new StringContent("1\": \"a\"\n\"2\": \"b\"\n\"\"\"12\"\"\": \"\"23\"\"\n\"'1\"2\\\"\"3'\": \"'1\"23\"4'", Encoding.UTF8, "application/x-www-form-urlencoded");
			HttpResponseMessage response = await client.SendAsync(request);
			string responseBody = await response.Content.ReadAsStringAsync();
			Console.WriteLine(responseBody);
		}
	}
}
