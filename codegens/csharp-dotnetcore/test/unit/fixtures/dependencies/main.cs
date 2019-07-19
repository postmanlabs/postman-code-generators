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
			client.DefaultRequestHeaders.Add("my-sample-header", "'Lorem ipsum dolor sit amet'");
			client.DefaultRequestHeaders.Add("not-disabled-header", "'ENABLED'");
			string response = await client.GetStringAsync("https://postman-echo.com/headers");
			Console.WriteLine(response.ToString());
		}
	}
}
