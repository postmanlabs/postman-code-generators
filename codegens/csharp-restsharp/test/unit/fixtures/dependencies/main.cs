using System;
using RestSharp;
namespace HelloWorldApplication {
class HelloWorld {
static void Main(string[] args) {
var client = new RestClient("https://postman-echo.com/patch");
var request = new RestRequest(Method.PATCH);
request.AddHeader("Content-Type", "text/plain");
request.AddParameter("text/plain", "Curabitur auctor, elit nec pulvinar porttitor, ex augue condimentum enim, eget suscipit urna felis quis neque.\nSuspendisse sit amet luctus massa, nec venenatis mi. Suspendisse tincidunt massa at nibh efficitur fringilla. Nam quis congue mi. Etiam volutpat.",  ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
 Console.WriteLine(response.Content);
}
}
}
