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
			string response = await client.GetStringAsync("https://704c30e8-77fe-4dc4-93e2-9c9c68dfb4e1.mock.pstmn.io/copy");
			Console.WriteLine(response.ToString());
		}
	}
}
