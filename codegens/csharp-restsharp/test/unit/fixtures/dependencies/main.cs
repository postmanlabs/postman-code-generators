using System;
using RestSharp;
namespace HelloWorldApplication {
class HelloWorld {
static void Main(string[] args) {
var client = new RestClient("https://704c30e8-77fe-4dc4-93e2-9c9c68dfb4e1.mock.pstmn.io/copy");
client.Timeout = 5000;
var request = new RestRequest();
IRestResponse response = client.ExecuteAsGet(request, "COPY");
Console.WriteLine(response.Content);}
}
}
