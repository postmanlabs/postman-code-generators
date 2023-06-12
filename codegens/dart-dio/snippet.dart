import 'dart:convert';
import 'package:dio/dio.dart';

void main() async {
  
      var dio = Dio();
      var response = await dio.request(
  
        'https://mockbin.org/redirect/302/1/?to=https://postman-echo.com/get',
        options: Options(
          method: 'GET',
  
          
          followRedirects: true,
  
          
        ),
  
        
      );;
  
  if (response.statusCode == 200) {
    print(json.encode(response.data));
  }
  else {
    print(response.statusMessage);
  }
  
}
