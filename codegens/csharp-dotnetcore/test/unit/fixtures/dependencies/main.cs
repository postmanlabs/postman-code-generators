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
			HttpResponseMessage response = await client.PostAsync("https://postman-echo.com/post", new StringContent("{\n  \"json\": \"Test-Test\"\n}", Encoding.UTF8, "application/json"));
			Console.WriteLine(response.ToString());
		}
	}
}
