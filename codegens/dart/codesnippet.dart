import 'dart:convert' as convert;
import 'package:http/http.dart' as http;

void main() async {
const url = "https://mockbin.org/redirect/302/1/?to=https://postman-echo.com/get";
const payload = {};
Map<String, String> headers= {};

var response = await http.get(url,
	headers: headers,
);

print(response.body);
}